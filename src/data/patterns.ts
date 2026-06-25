/**
 * 互锁/互斥模式库
 * 用于识别用户岗位中多个维度之间的交互效应
 */

export type PatternType = 'interlock' | 'contradiction';

export interface Pattern {
  id: string;
  type: PatternType;
  name: string;
  description: string;
  /**
   * 触发条件：各层的评分要求
   * key = layerId, value = 要求的score数组
   */
  trigger: Record<number, number[]>;
  /**
   * 要求对应层是刚性壁垒（仅interlock需要）
   */
  rigidityRequired?: Record<number, boolean>;
  /** 解读文案 */
  interpretation: string;
  /** 行动建议 */
  suggestion: string;
}

export const PATTERNS: Pattern[] = [
  // ===== 互锁模式 =====
  {
    id: 'interlock-1',
    type: 'interlock',
    name: '三重刚性互锁',
    description: '低容错 × 有责任 × 隐性信息 = 护城河极深',
    trigger: { 2: [2], 5: [2], 4: [1, 2] },
    rigidityRequired: { 2: true, 5: true },
    interpretation: '你的岗位存在三重刚性互锁：不可逆容错+法律/商业后果+隐性信息。这意味着AI不仅做不好（信息看不见），而且做错了后果严重（不可逆+要追责），组织不敢让AI做。这是最深层次的护城河。',
    suggestion: '你的核心壁垒非常坚固，短期内AI无法突破。但要注意：隐性信息层是半刚性的，组织可能在推动信息显性化。保持你在隐性信息上的优势是长期关键。',
  },
  {
    id: 'interlock-2',
    type: 'interlock',
    name: '责任-信任双锁',
    description: '有责任 × 需要个人信任 = 双重锁定',
    trigger: { 5: [2], 6: [2] },
    rigidityRequired: { 5: true, 6: true },
    interpretation: '责任归属+个人信任形成双重锁定：AI不仅做不了（没人信它），而且不敢让它做（出了事没人扛）。这是法律制度+人性的双重壁垒。',
    suggestion: '这个组合非常安全。法律制度只认人作为责任主体，人际信任无法被AI获得。短期内不需要担心。',
  },
  {
    id: 'interlock-3',
    type: 'interlock',
    name: '过程-信息双锁',
    description: '过程即关系 × 全隐性信息 = 关系壁垒',
    trigger: { 3: [2], 4: [2] },
    rigidityRequired: { 3: true, 4: true },
    interpretation: '过程即关系+全隐性信息：你的核心工作就是在隐性信息中建立关系。AI既看不到信息（全隐性），也替代不了关系建立的过程（过程即关系）。这是最人性的壁垒。',
    suggestion: '人际关系是最难被AI替代的领域。持续加强你在组织中的关系网络和隐性信息优势。',
  },
  {
    id: 'interlock-4',
    type: 'interlock',
    name: '不可逆+过程即思考',
    description: '不可逆容错 × 过程即思考 = 决策壁垒',
    trigger: { 2: [2], 3: [1, 2] },
    rigidityRequired: { 2: true },
    interpretation: '不可逆容错+过程即思考：你的决策一旦做出无法撤回，而决策的质量恰恰来自于思考过程。AI跳过思考过程直接给结果，在不可逆场景下是不能接受的。',
    suggestion: '这是决策型岗位的核心壁垒。确保你的价值体现在"决策质量"上，而不仅仅是"做决策"这个动作。',
  },
  {
    id: 'interlock-5',
    type: 'interlock',
    name: '全隐性+个人信任',
    description: '全隐性信息 × 需要个人信任 = 权力壁垒',
    trigger: { 4: [2], 6: [2] },
    rigidityRequired: { 4: true, 6: true },
    interpretation: '全隐性信息+个人信任：你掌握的信息别人看不到，而你说的别人信。这就是权力。AI既看不到信息，也没有信任基础。',
    suggestion: '这是最稳固的壁垒组合，也是最"不可替代"的。但要注意：过于依赖隐性信息可能限制你的职业发展广度。',
  },

  // ===== 互斥模式 =====
  {
    id: 'contradiction-1',
    type: 'contradiction',
    name: '容错可改造陷阱',
    description: '低容错 × 信息全显性 × 过程无价值 = 组织会制造容错',
    trigger: { 2: [2], 4: [0], 3: [0] },
    interpretation: '你的任务看起来有"不可逆"的容错壁垒保护，但信息全显性+过程无价值意味着：组织有动力也有能力通过加流程（灰度、审批、回滚机制）来人为提高容错性。一旦容错性被改造，AI就能进来。',
    suggestion: '危险！看似有壁垒，实际是柔性的。你的"不可逆"可能只是当前流程不够完善，一旦组织投入资源改造，壁垒就会消失。建议尽快向有隐性信息或过程价值的任务转移。',
  },
  {
    id: 'contradiction-2',
    type: 'contradiction',
    name: '信息显性化陷阱',
    description: '半隐性信息 × 过程无价值 = 信息会被显性化',
    trigger: { 4: [1], 3: [0] },
    interpretation: '你的任务依赖半隐性信息（经验），但过程没有独立价值。这意味着组织有动力把你的经验SOP化、文档化。一旦信息显性化，AI就能做。',
    suggestion: '你的经验优势是暂时的。建议主动把经验SOP化（占据规则制定者的位置），而不是守着经验（守不住的）。',
  },
  {
    id: 'contradiction-3',
    type: 'contradiction',
    name: '组织信任可转移陷阱',
    description: '需要组织信任 × 信息全显性 × 过程无价值 = 信任会转移到系统',
    trigger: { 6: [1], 4: [0], 3: [0] },
    interpretation: '你的任务需要组织信任（如需要特定资质），但信息全显性+过程无价值意味着：随着AI系统的可靠性提升，组织信任可能从"人"转移到"系统"。审计报告从"四大会计师事务所盖章"可能变成"AI审计系统认证"。',
    suggestion: '组织信任是柔性的，会随技术成熟度转移。你的安全期取决于AI系统在你这个领域的成熟速度。建议同时建立个人信任（个人信用、关系网络），个人信任是刚性的。',
  },
  {
    id: 'contradiction-4',
    type: 'contradiction',
    name: '责任转移陷阱',
    description: '组织内后果 × 信息全显性 × 过程无价值 = 责任会被制度吸收',
    trigger: { 5: [1], 4: [0], 3: [0] },
    interpretation: '你的任务有"组织内后果"，但信息全显性+过程无价值。组织可能通过制度调整（如加审批流、加自动化校验）来吸收责任，将"人扛"变成"系统扛+人抽检"。',
    suggestion: '组织内后果是柔性的。从"人扛"到"系统扛+人抽检"的转变已经开始。建议向有法律/商业后果（刚性责任）的任务方向靠拢。',
  },
  {
    id: 'contradiction-5',
    type: 'contradiction',
    name: '沙滩效应',
    description: '大量任务前3层全通过 = 岗位的沙滩正在被潮水冲走',
    trigger: { 1: [0], 2: [0, 1], 3: [0] },
    interpretation: '你有很多任务在前3层就通过了（产物可自证+容错可修正+过程无价值），这些是AI最容易替代的"沙滩"任务。即使你的岗位有深层壁垒保护，沙滩也会被逐步冲走。',
    suggestion: '沙滩任务是保不住的，不要把精力花在防守沙滩上。主动把沙滩任务AI化，释放时间投入到城墙任务（第4-6层被拦截的任务）上。',
  },
];

/**
 * 匹配岗位的互锁/互斥模式
 */
export function matchPatterns(
  tasks: Array<{ funnelScores: Array<{ layerId: number; score: number; isRigid?: boolean }> }>,
): Pattern[] {
  const matched: Pattern[] = [];

  // 汇总所有任务在各层的最高分和刚性状态
  const layerMaxScores: Record<number, number> = {};
  const layerHasRigid: Record<number, boolean> = {};

  for (const task of tasks) {
    for (const fs of task.funnelScores) {
      if (!layerMaxScores[fs.layerId] || fs.score > layerMaxScores[fs.layerId]) {
        layerMaxScores[fs.layerId] = fs.score;
      }
      if (fs.isRigid) {
        layerHasRigid[fs.layerId] = true;
      }
    }
  }

  for (const pattern of PATTERNS) {
    let isMatched = true;

    for (const [layerIdStr, requiredScores] of Object.entries(pattern.trigger)) {
      const layerId = Number(layerIdStr);
      const maxScore = layerMaxScores[layerId] ?? 0;
      if (!requiredScores.includes(maxScore)) {
        isMatched = false;
        break;
      }
    }

    // 检查刚性要求
    if (isMatched && pattern.rigidityRequired) {
      for (const [layerIdStr, required] of Object.entries(pattern.rigidityRequired)) {
        const layerId = Number(layerIdStr);
        if (required && !layerHasRigid[layerId]) {
          isMatched = false;
          break;
        }
      }
    }

    if (isMatched) {
      matched.push(pattern);
    }
  }

  return matched;
}