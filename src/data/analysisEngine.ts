/**
 * 岗位模式判断算法 - 核心分析引擎
 * 
 * 功能：
 * 1. 计算每个任务的漏斗通过率 → 判断任务被替代风险
 * 2. 计算岗位整体替代风险 → 判断岗位模式（吞噬/重构/免疫）
 * 3. 刚性/柔性壁垒分析
 * 4. 生成行动建议
 */

import type { FunnelScore } from './funnelLayers';
import type { Task } from './jobTemplates';
import type { Pattern } from './patterns';
import { matchPatterns } from './patterns';
import { getDefaultRigidType } from './rigidRules';

// ========== 类型定义 ==========

/** 任务的替代风险等级 */
export type TaskRiskLevel = 'low' | 'medium' | 'high';

/** 岗位的替代模式 */
export type JobPattern = 'swallow' | 'restructure' | 'immune';

/** 单个任务的分析结果 */
export interface TaskAnalysis {
  task: Task;
  /** 漏斗通过层数（0-6，0=第1层就被拦住，6=全部通过） */
  passedLayers: number;
  /** 第一个被拦住的层ID，null=全部通过 */
  firstBlockedLayer: number | null;
  /** 各层详细得分 */
  layerDetails: Array<{
    layerId: number;
    score: FunnelScore;
    passed: boolean;
    isRigid: boolean | null; // null=不需要判断
    rigidType?: 'rigid' | 'flexible';
  }>;
  /** 替代风险等级 */
  riskLevel: TaskRiskLevel;
  /** 风险说明 */
  riskDescription: string;
}

/** 岗位整体分析结果 */
export interface JobAnalysis {
  /** 各任务分析结果 */
  taskAnalyses: TaskAnalysis[];
  /** 匹配到的互锁/互斥模式 */
  patterns: Pattern[];
  
  // ---- 核心指标 ----
  /** 沙滩任务时间占比（高风险任务占工作时间的百分比） */
  beachTimeRatio: number;
  /** 城墙任务时间占比（低风险任务占工作时间的百分比） */
  wallTimeRatio: number;
  /** 混合任务时间占比（中等风险任务占工作时间的百分比） */
  mixedTimeRatio: number;
  /** 加权漏斗通过率（0-1，越高越容易被替代） */
  weightedPassRate: number;
  /** 刚性壁垒数量 */
  rigidBarrierCount: number;
  /** 柔性壁垒数量 */
  flexibleBarrierCount: number;
  
  // ---- 岗位模式判断 ----
  /** 岗位替代模式 */
  jobPattern: JobPattern;
  /** 模式说明 */
  patternDescription: string;
  
  // ---- 行动建议 ----
  /** 总体建议 */
  overallSuggestion: string;
  /** 分层建议 */
  actionItems: ActionItem[];
}

/** 行动建议项 */
export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  category: 'abandon' | 'fortify' | 'transform' | 'watch';
  title: string;
  description: string;
  targetTaskIds?: string[];
}

// ========== 核心算法 ==========

/**
 * 判断单层是否通过
 * score=0 表示通过，score>0 表示被拦住
 */
function isLayerPassed(score: FunnelScore): boolean {
  return score === 0;
}

/**
 * 分析单个任务
 */
export function analyzeTask(task: Task): TaskAnalysis {
  let passedLayers = 0;
  let firstBlockedLayer: number | null = null;
  const layerDetails: TaskAnalysis['layerDetails'] = [];

  for (const fs of task.funnelScores) {
    const passed = isLayerPassed(fs.score);
    if (passed) {
      passedLayers++;
    } else if (firstBlockedLayer === null) {
      firstBlockedLayer = fs.layerId;
    }

    // 判断刚性/柔性
    let isRigid: boolean | null = null;
    let rigidType: 'rigid' | 'flexible' | undefined;
    if (fs.score > 0 && fs.layerId >= 2) {
      isRigid = fs.isRigid ?? false;
      rigidType = fs.isRigid ? 'rigid' : (getDefaultRigidType(fs.layerId, fs.score) ?? undefined);
    }

    layerDetails.push({
      layerId: fs.layerId,
      score: fs.score,
      passed,
      isRigid,
      rigidType,
    });
  }

  // 计算风险等级
  const totalScore = task.funnelScores.reduce((sum, fs) => sum + fs.score, 0);
  const maxScore = task.funnelScores.length * 2;
  const passRate = totalScore / maxScore;

  let riskLevel: TaskRiskLevel;
  let riskDescription: string;

  if (passRate <= 0.25) {
    riskLevel = 'low';
    riskDescription = '该任务漏斗拦截率高，AI短期内难以替代';
  } else if (passRate <= 0.58) {
    riskLevel = 'medium';
    riskDescription = '该任务部分环节可被AI辅助，但核心环节仍有壁垒';
  } else {
    riskLevel = 'high';
    riskDescription = '该任务漏斗通过率高，AI替代风险较大';
  }

  // 对通过全部6层的任务，强制设为高风险
  if (passedLayers === 6) {
    riskLevel = 'high';
    riskDescription = '该任务通过全部6层漏斗，AI可完整替代';
  }

  return {
    task,
    passedLayers,
    firstBlockedLayer,
    layerDetails,
    riskLevel,
    riskDescription,
  };
}

/**
 * 分析岗位整体
 */
export function analyzeJob(tasks: Task[]): JobAnalysis {
  // 1. 分析每个任务
  const taskAnalyses = tasks.map(analyzeTask);

  // 2. 匹配互锁/互斥模式
  const patterns = matchPatterns(tasks);

  // 3. 计算核心指标
  let beachTime = 0;   // 高风险任务时间
  let wallTime = 0;    // 低风险任务时间
  let mixedTime = 0;   // 中等风险任务时间
  let weightedPassSum = 0;

  let rigidBarriers = 0;
  let flexibleBarriers = 0;

  for (const ta of taskAnalyses) {
    const timeRatio = ta.task.timeRatio;
    switch (ta.riskLevel) {
      case 'high': beachTime += timeRatio; break;
      case 'low': wallTime += timeRatio; break;
      case 'medium': mixedTime += timeRatio; break;
    }

    // 加权通过率
    const passRate = ta.passedLayers / 6;
    weightedPassSum += passRate * timeRatio;

    // 统计刚性/柔性壁垒
    for (const ld of ta.layerDetails) {
      if (!ld.passed && ld.layerId >= 2) {
        if (ld.rigidType === 'rigid') {
          rigidBarriers++;
        } else if (ld.rigidType === 'flexible') {
          flexibleBarriers++;
        }
      }
    }
  }

  const totalTaskTime = tasks.reduce((sum, t) => sum + t.timeRatio, 0);
  const beachTimeRatio = totalTaskTime > 0 ? beachTime / totalTaskTime : 0;
  const wallTimeRatio = totalTaskTime > 0 ? wallTime / totalTaskTime : 0;
  const mixedTimeRatio = totalTaskTime > 0 ? mixedTime / totalTaskTime : 0;
  const weightedPassRate = totalTaskTime > 0 ? weightedPassSum / totalTaskTime : 0;

  // 4. 判断岗位模式
  const { jobPattern, patternDescription } = determineJobPattern(
    beachTimeRatio,
    wallTimeRatio,
    weightedPassRate,
    rigidBarriers,
  );

  // 5. 生成行动建议
  const { overallSuggestion, actionItems } = generateSuggestions(
    taskAnalyses,
    patterns,
    jobPattern,
    beachTimeRatio,
    wallTimeRatio,
    rigidBarriers,
    flexibleBarriers,
  );

  return {
    taskAnalyses,
    patterns,
    beachTimeRatio,
    wallTimeRatio,
    mixedTimeRatio,
    weightedPassRate,
    rigidBarrierCount: rigidBarriers,
    flexibleBarrierCount: flexibleBarriers,
    jobPattern,
    patternDescription,
    overallSuggestion,
    actionItems,
  };
}

/**
 * 判断岗位替代模式
 */
function determineJobPattern(
  beachRatio: number,
  wallRatio: number,
  passRate: number,
  rigidCount: number,
): { jobPattern: JobPattern; patternDescription: string } {
  // 吞噬型：沙滩占比高(>50%)，加权通过率高(>0.5)，刚性壁垒少
  if (beachRatio > 0.5 && passRate > 0.5 && rigidCount <= 1) {
    return {
      jobPattern: 'swallow',
      patternDescription: '吞噬型：你的岗位大部分任务都能通过漏斗，且缺乏刚性壁垒保护。AI将整体性替代你的岗位，而非逐步蚕食。这是最危险的信号。',
    };
  }

  // 免疫型：城墙占比高(>40%)，刚性壁垒多(>=3)
  if (wallRatio > 0.4 && rigidCount >= 3) {
    return {
      jobPattern: 'immune',
      patternDescription: '免疫型：你的岗位核心任务有多重刚性壁垒保护，AI短期内无法突破。但要注意沙滩任务会被蚕食，岗位范围会缩小。',
    };
  }

  // 重构型：混合状态
  return {
    jobPattern: 'restructure',
    patternDescription: '重构型：你的岗位既有沙滩任务（会被AI替代），也有城墙任务（有壁垒保护）。AI不会整体替代你，但会重塑你的工作内容——替代沙滩、保留城墙、可能创造新任务。',
  };
}

/**
 * 生成行动建议
 */
function generateSuggestions(
  taskAnalyses: TaskAnalysis[],
  patterns: Pattern[],
  jobPattern: JobPattern,
  beachRatio: number,
  wallRatio: number,
  _rigidCount: number,
  flexibleCount: number,
): { overallSuggestion: string; actionItems: ActionItem[] } {
  const actionItems: ActionItem[] = [];

  // 高风险任务 → abandon 建议
  const highRiskTasks = taskAnalyses.filter(ta => ta.riskLevel === 'high');
  if (highRiskTasks.length > 0) {
    actionItems.push({
      priority: 'high',
      category: 'abandon',
      title: '主动AI化沙滩任务',
      description: `你有${highRiskTasks.length}个高风险任务（占工作时间${Math.round(beachRatio * 100)}%），这些任务通过漏斗率高，AI替代是必然趋势。不要防守沙滩，主动AI化这些任务，释放时间投入城墙任务。`,
      targetTaskIds: highRiskTasks.map(ta => ta.task.id),
    });
  }

  // 中等风险任务 → transform 建议
  const mediumRiskTasks = taskAnalyses.filter(ta => ta.riskLevel === 'medium');
  if (mediumRiskTasks.length > 0) {
    actionItems.push({
      priority: 'medium',
      category: 'transform',
      title: '转型混合任务',
      description: `你有${mediumRiskTasks.length}个中等风险任务（占工作时间${Math.round((beachRatio > 0 ? 0 : 1) * 0)}%），这些任务部分环节可被AI辅助。重点发展AI无法替代的环节（隐性信息获取、关系建立、决策判断），将可替代环节交给AI。`,
      targetTaskIds: mediumRiskTasks.map(ta => ta.task.id),
    });
  }

  // 低风险任务 → fortify 建议
  const lowRiskTasks = taskAnalyses.filter(ta => ta.riskLevel === 'low');
  if (lowRiskTasks.length > 0) {
    actionItems.push({
      priority: 'high',
      category: 'fortify',
      title: '加固城墙任务',
      description: `你有${lowRiskTasks.length}个低风险任务（占工作时间${Math.round(wallRatio * 100)}%），这是你的护城河。确保这些任务的壁垒是刚性的（不可逆容错、法律责任、个人信任），而非柔性的（组织信任、半隐性信息）。`,
      targetTaskIds: lowRiskTasks.map(ta => ta.task.id),
    });
  }

  // 柔性壁垒 → watch 建议
  if (flexibleCount > 0) {
    actionItems.push({
      priority: 'medium',
      category: 'watch',
      title: '警惕柔性壁垒降级',
      description: `你有${flexibleCount}个柔性壁垒。柔性壁垒可以被组织或技术改造（如信息显性化、责任制度化、信任系统化），从而被AI突破。关注这些壁垒的变化趋势。`,
    });
  }

  // 互锁模式 → fortify 建议
  const interlockPatterns = patterns.filter(p => p.type === 'interlock');
  if (interlockPatterns.length > 0) {
    actionItems.push({
      priority: 'low',
      category: 'fortify',
      title: '利用互锁效应',
      description: `你存在${interlockPatterns.length}个互锁效应（${interlockPatterns.map(p => p.name).join('、')}），这些互锁使你的壁垒更加坚固。保持这些维度的一致性，不要让任何一个维度弱化。`,
    });
  }

  // 互斥模式 → watch 建议
  const contradictionPatterns = patterns.filter(p => p.type === 'contradiction');
  if (contradictionPatterns.length > 0) {
    actionItems.push({
      priority: 'high',
      category: 'watch',
      title: '防范互斥陷阱',
      description: `你存在${contradictionPatterns.length}个互斥陷阱（${contradictionPatterns.map(p => p.name).join('、')}），这些互斥意味着你的某些壁垒是脆弱的，可能被组织或技术改造突破。`,
    });
  }

  // 根据模式给出总体建议
  let overallSuggestion: string;
  switch (jobPattern) {
    case 'swallow':
      overallSuggestion = '你的岗位属于吞噬型——AI将整体性替代大部分工作内容。这不是渐进式的蚕食，而是结构性的替代。你需要在AI全面替代之前完成转型：要么转向岗位内少量有壁垒的任务方向，要么规划职业转型。时间窗口取决于你所在行业的AI渗透速度，但方向是确定的。';
      break;
    case 'immune':
      overallSuggestion = '你的岗位属于免疫型——核心任务有多重刚性壁垒保护，AI短期内无法突破。但这不意味着你可以高枕无忧：1）沙滩任务会被蚕食，岗位范围会缩小；2）柔性壁垒可能被组织改造；3）技术进步可能创造新的替代路径。保持警惕，持续加固城墙。';
      break;
    case 'restructure':
      overallSuggestion = '你的岗位属于重构型——AI不会整体替代你，但会重塑你的工作内容。沙滩任务会被替代，城墙任务会被保留，同时可能产生新的AI协作任务。关键策略：主动放弃沙滩、加固城墙、学习与AI协作。你的"新岗位"将由城墙任务+AI协作任务组成。';
      break;
  }

  return { overallSuggestion, actionItems };
}

/**
 * 生成雷达图数据（6层得分，用于前端可视化）
 */
export function generateRadarData(
  taskAnalyses: TaskAnalysis[],
): Array<{ layerId: number; layerName: string; avgScore: number; maxScore: number; minScore: number }> {
  const layerCount = 6;
  const result: Array<{ layerId: number; layerName: string; avgScore: number; maxScore: number; minScore: number }> = [];

  const layerNames: Record<number, string> = {
    1: '产物自证',
    2: '人工修正',
    3: '过程价值',
    4: '信息可见度',
    5: '责任归属',
    6: '信任锚定',
  };

  for (let i = 1; i <= layerCount; i++) {
    const scores = taskAnalyses.map(ta => {
      const detail = ta.layerDetails.find(ld => ld.layerId === i);
      return detail ? detail.score : 0;
    });

    const weightedScores = taskAnalyses.map(ta => {
      const detail = ta.layerDetails.find(ld => ld.layerId === i);
      return detail ? detail.score * (ta.task.timeRatio / 100) : 0;
    });

    const totalWeight = taskAnalyses.reduce((sum, ta) => sum + ta.task.timeRatio, 0) / 100;

    result.push({
      layerId: i,
      layerName: layerNames[i],
      avgScore: totalWeight > 0 ? weightedScores.reduce((a, b) => a + b, 0) / totalWeight : 0,
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
    });
  }

  return result;
}

/**
 * 生成漏斗图数据（每层的通过率，用于前端可视化）
 */
export function generateFunnelData(
  taskAnalyses: TaskAnalysis[],
): Array<{ layerId: number; layerName: string; passRate: number; weightedPassRate: number }> {
  const layerCount = 6;
  const result: Array<{ layerId: number; layerName: string; passRate: number; weightedPassRate: number }> = [];

  const layerNames: Record<number, string> = {
    1: '产物自证',
    2: '人工修正',
    3: '过程价值',
    4: '信息可见度',
    5: '责任归属',
    6: '信任锚定',
  };

  for (let i = 1; i <= layerCount; i++) {
    // 简单通过率：该层得0分的任务数/总任务数
    const passCount = taskAnalyses.filter(ta => {
      const detail = ta.layerDetails.find(ld => ld.layerId === i);
      return detail && detail.score === 0;
    }).length;
    const passRate = taskAnalyses.length > 0 ? passCount / taskAnalyses.length : 0;

    // 加权通过率：按时间占比加权
    const weightedPassSum = taskAnalyses.reduce((sum, ta) => {
      const detail = ta.layerDetails.find(ld => ld.layerId === i);
      const passed = detail && detail.score === 0 ? 1 : 0;
      return sum + passed * (ta.task.timeRatio / 100);
    }, 0);
    const totalWeight = taskAnalyses.reduce((sum, ta) => sum + ta.task.timeRatio, 0) / 100;
    const weightedPassRate = totalWeight > 0 ? weightedPassSum / totalWeight : 0;

    result.push({
      layerId: i,
      layerName: layerNames[i],
      passRate,
      weightedPassRate,
    });
  }

  return result;
}