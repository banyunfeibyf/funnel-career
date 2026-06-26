import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '../store';
import { analyzeJob, generateFunnelData, generateRadarData, type JobAnalysis, type TaskAnalysis } from '../data/analysisEngine';
import { FUNNEL_LAYERS } from '../data/funnelLayers';
import { Button, Toast } from 'antd-mobile';
import * as echarts from 'echarts';

/** 原生 ECharts hook：不依赖 echarts-for-react，避免兼容性问题 */
function useECharts(option: echarts.EChartsOption, height: number) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }
    instanceRef.current.setOption(option, true);
  }, [option]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const handleResize = () => {
      instanceRef.current?.resize();
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(el);
    return () => {
      ro.disconnect();
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, []);

  return { chartRef, style: { height } };
}

/** 雷达图组件 */
function RadarChartComponent({ analysis }: { analysis: JobAnalysis }) {
  const radarData = useMemo(() => generateRadarData(analysis.taskAnalyses), [analysis]);

  if (radarData.length === 0) {
    return <div style={{ padding: 20, color: '#999', textAlign: 'center' }}>暂无数据</div>;
  }

  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: radarData.map(d => ({ name: d.layerName, max: 2 })),
      shape: 'polygon',
      splitNumber: 2,
      axisName: { color: '#666', fontSize: 11 },
      splitArea: {
        areaStyle: {
          color: ['rgba(82,196,26,0.1)', 'rgba(250,173,20,0.1)', 'rgba(255,77,79,0.1)'],
        },
      },
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData.map(d => Math.round(d.avgScore * 10) / 10),
        name: '壁垒强度',
        areaStyle: { color: 'rgba(255, 77, 79, 0.2)' },
        lineStyle: { color: '#ff4d4f', width: 2 },
        itemStyle: { color: '#ff4d4f' },
      }],
    }],
  };

  const { chartRef, style } = useECharts(option, 280);
  return <div ref={chartRef} style={style} />;
}

/** 漏斗穿透率柱状图组件 */
function FunnelChartComponent({ analysis }: { analysis: JobAnalysis }) {
  const funnelData = useMemo(() => generateFunnelData(analysis.taskAnalyses), [analysis]);

  if (funnelData.length === 0) {
    return <div style={{ padding: 20, color: '#999', textAlign: 'center' }}>暂无数据</div>;
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 80, right: 40, top: 10, bottom: 20 },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: funnelData.map(d => d.layerName).reverse(),
      axisLabel: { fontSize: 12 },
    },
    series: [{
      type: 'bar',
      data: funnelData.map(d => ({
        value: Math.round(d.weightedPassRate * 100),
        itemStyle: {
          color: d.weightedPassRate > 0.6 ? '#ff4d4f' : d.weightedPassRate > 0.3 ? '#faad14' : '#52c41a',
          borderRadius: [0, 4, 4, 0],
        },
      })).reverse(),
      barWidth: 18,
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, fontWeight: 600 },
    }],
  };

  const { chartRef, style } = useECharts(option, 240);
  return <div ref={chartRef} style={style} />;
}

export default function ResultPage() {
  const { state, setStep, setJobAnalysis } = useAppState();
  const { customTasks, taskScores, selectedTaskIds, jobAnalysis, selectedJob } = state;
  const reportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveReport = async () => {
    if (!reportRef.current) return;
    setSaving(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#f5f5f5',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `漏斗职业-${selectedJob?.name || '分析报告'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      Toast.show({ content: '报告已保存' });
    } catch {
      Toast.show({ content: '保存失败，请截图保存' });
    } finally {
      setSaving(false);
    }
  };

  // 当数据就绪时计算分析结果，依赖 jobAnalysis 确保页面进入时也能触发
  useEffect(() => {
    const activeTasks = customTasks.filter(t => selectedTaskIds.has(t.id));
    if (activeTasks.length === 0 || taskScores.length === 0) return;

    const tasksWithScores = activeTasks.map(task => {
      const scores = taskScores.find(ts => ts.taskId === task.id);
      if (!scores) return task;

      return {
        ...task,
        funnelScores: task.funnelScores.map(fs => ({
          ...fs,
          score: scores.scores[fs.layerId] ?? fs.score,
          isRigid: scores.rigidOverrides[fs.layerId] !== undefined
            ? scores.rigidOverrides[fs.layerId]
            : fs.isRigid,
        })),
      };
    });

    const analysis = analyzeJob(tasksWithScores);
    setJobAnalysis(analysis);
  }, [customTasks, taskScores, selectedTaskIds, setJobAnalysis]);

  if (!jobAnalysis) {
    return (
      <div className="page-container">
        <div className="page-title">分析中...</div>
        <div className="page-subtitle" style={{ marginTop: 8 }}>正在计算漏斗分析结果...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div ref={reportRef}>
      {/* 报告头部 */}
      <div style={{ textAlign: 'center', marginBottom: 16, padding: '16px 0 8px' }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>漏斗职业</div>
        <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
          {selectedJob?.icon} {selectedJob?.name} · AI替代性分析报告
        </div>
      </div>

      {/* 岗位模式 */}
      <PatternBadge pattern={jobAnalysis.jobPattern} />
      <div style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 20, color: '#333' }}>
        {jobAnalysis.patternDescription}
      </div>

      {/* 任务风险分布 */}
      <div className="result-section">
        <div className="result-section-title">📊 任务风险分布</div>
        <div className="ratio-bar">
          <div className="ratio-bar-beach" style={{ width: `${jobAnalysis.beachTimeRatio * 100}%` }} />
          <div className="ratio-bar-mixed" style={{ width: `${jobAnalysis.mixedTimeRatio * 100}%` }} />
          <div className="ratio-bar-wall" style={{ width: `${jobAnalysis.wallTimeRatio * 100}%` }} />
        </div>
        <div className="ratio-legend">
          <div className="ratio-legend-item">
            <div className="ratio-legend-dot" style={{ background: 'var(--color-danger)' }} />
            <span>沙滩任务 {Math.round(jobAnalysis.beachTimeRatio * 100)}%</span>
          </div>
          <div className="ratio-legend-item">
            <div className="ratio-legend-dot" style={{ background: 'var(--color-warning)' }} />
            <span>混合任务 {Math.round(jobAnalysis.mixedTimeRatio * 100)}%</span>
          </div>
          <div className="ratio-legend-item">
            <div className="ratio-legend-dot" style={{ background: 'var(--color-success)' }} />
            <span>城墙任务 {Math.round(jobAnalysis.wallTimeRatio * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 六维雷达图 */}
      <div className="result-section">
        <div className="result-section-title">🎯 六维壁垒雷达</div>
        <RadarChartComponent analysis={jobAnalysis} />
      </div>

      {/* 漏斗穿透图 */}
      <div className="result-section">
        <div className="result-section-title">🔽 漏斗穿透率（按时间加权）</div>
        <FunnelChartComponent analysis={jobAnalysis} />
      </div>

      {/* 各任务风险明细 */}
      <div className="result-section">
        <div className="result-section-title">📋 各任务风险明细</div>
        {jobAnalysis.taskAnalyses.map(ta => (
          <TaskRiskCard key={ta.task.id} analysis={ta} />
        ))}
      </div>

      {/* 壁垒统计 */}
      <div className="result-section">
        <div className="result-section-title">🛡️ 壁垒统计</div>
        <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
          <div style={{ flex: 1, padding: 16, borderRadius: 12, background: '#fff1f0' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-danger)' }}>
              {jobAnalysis.rigidBarrierCount}
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>刚性壁垒</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>不可改造，长期保护</div>
          </div>
          <div style={{ flex: 1, padding: 16, borderRadius: 12, background: '#fff7e6' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-warning)' }}>
              {jobAnalysis.flexibleBarrierCount}
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>柔性壁垒</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>可能被改造，会消退</div>
          </div>
        </div>
      </div>

      {/* 互锁/互斥模式 */}
      {jobAnalysis.patterns.length > 0 && (
        <div className="result-section">
          <div className="result-section-title">🔗 互锁与互斥模式</div>
          {jobAnalysis.patterns.map(pattern => (
            <div key={pattern.id} className={`pattern-card ${pattern.type}`}>
              <div className="pattern-card-name">
                {pattern.type === 'interlock' ? '🔒' : '⚠️'} {pattern.name}
              </div>
              <div className="pattern-card-desc">{pattern.description}</div>
              <div className="pattern-card-interpretation">{pattern.interpretation}</div>
              <div className="pattern-card-suggestion">💡 {pattern.suggestion}</div>
            </div>
          ))}
        </div>
      )}

      {/* 总体建议 */}
      <div className="result-section">
        <div className="result-section-title">💬 总体建议</div>
        <div style={{
          background: '#f0f5ff', borderRadius: 12, padding: 16,
          fontSize: 14, lineHeight: 1.8, color: '#333',
        }}>
          {jobAnalysis.overallSuggestion}
        </div>
      </div>

      {/* 行动建议 */}
      <div className="result-section">
        <div className="result-section-title">🎯 行动建议</div>
        {jobAnalysis.actionItems.map((item, i) => (
          <div key={i} className="action-item">
            <div className="action-item-header">
              <span className={`action-item-priority ${item.priority}`}>
                {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
              </span>
              <span className="action-item-category">
                {item.category === 'abandon' ? '放弃沙滩' :
                 item.category === 'fortify' ? '加固城墙' :
                 item.category === 'transform' ? '转型混合' : '持续关注'}
              </span>
            </div>
            <div className="action-item-title">{item.title}</div>
            <div className="action-item-desc">{item.description}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 16 }} />
      </div>{/* end reportRef */}

      <div className="bottom-bar">
        <Button onClick={() => setStep(0)}>重新开始</Button>
        <Button
          color="primary"
          onClick={handleSaveReport}
          loading={saving}
        >
          保存报告图片
        </Button>
      </div>
    </div>
  );
}

function PatternBadge({ pattern }: { pattern: string }) {
  const config: Record<string, { label: string; className: string }> = {
    swallow: { label: '吞噬型', className: 'swallow' },
    restructure: { label: '重构型', className: 'restructure' },
    immune: { label: '免疫型', className: 'immune' },
  };
  const c = config[pattern] || config.restructure;
  return <span className={`pattern-badge ${c.className}`}>{c.label}</span>;
}

function TaskRiskCard({ analysis }: { analysis: TaskAnalysis }) {
  const riskConfig: Record<string, { label: string; className: string }> = {
    high: { label: '高风险', className: 'high' },
    medium: { label: '中风险', className: 'medium' },
    low: { label: '低风险', className: 'low' },
  };
  const rc = riskConfig[analysis.riskLevel] || riskConfig.medium;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="task-card-name">{analysis.task.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="task-card-ratio">{analysis.task.timeRatio}%</span>
          <span className={`risk-tag ${rc.className}`}>{rc.label}</span>
        </div>
      </div>
      <div className="task-card-desc">{analysis.riskDescription}</div>
      <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {analysis.layerDetails.map(ld => {
          const layer = FUNNEL_LAYERS.find(l => l.id === ld.layerId);
          const color = ld.score === 0 ? '#52c41a' : ld.score === 1 ? '#faad14' : '#ff4d4f';
          return (
            <span key={ld.layerId} style={{
              fontSize: 11, padding: '1px 6px', borderRadius: 4,
              background: color + '20', color, border: `1px solid ${color}40`,
            }}>
              {layer?.shortName || `L${ld.layerId}`}
            </span>
          );
        })}
      </div>
    </div>
  );
}