import { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../store';
import { RIGID_RULES } from '../data/rigidRules';
import { Button } from 'antd-mobile';

export default function RigidJudgePage() {
  const { state, setStep, setRigidOverride } = useAppState();
  const { customTasks, taskScores, selectedTaskIds } = state;

  // 收集所有需要刚性判断的项：基于用户实际评分，score > 0 且 layerId >= 2
  const rigidItems = useMemo(() => {
    const items: Array<{
      taskId: string;
      taskName: string;
      layerId: number;
      score: number;
      rule: typeof RIGID_RULES[number];
    }> = [];

    const activeTasks = customTasks.filter(t => selectedTaskIds.has(t.id));

    for (const task of activeTasks) {
      const userScores = taskScores.find(ts => ts.taskId === task.id);
      if (!userScores) continue;

      for (let layerId = 2; layerId <= 6; layerId++) {
        const score = userScores.scores[layerId];
        if (score !== undefined && score > 0) {
          const rule = RIGID_RULES.find(r => r.layerId === layerId);
          if (rule) {
            items.push({
              taskId: task.id,
              taskName: task.name,
              layerId,
              score,
              rule,
            });
          }
        }
      }
    }

    return items;
  }, [customTasks, taskScores, selectedTaskIds]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 当rigidItems变化时重置index
  useEffect(() => {
    setCurrentIndex(0);
  }, [rigidItems.length]);

  if (rigidItems.length === 0) {
    return (
      <div className="page-container">
        <div className="page-title">无需刚性判断</div>
        <div className="page-subtitle">
          你的所有任务在各层都通过了漏斗，不需要进行刚性/柔性判断。
        </div>
        <div className="bottom-bar">
          <Button onClick={() => setStep(2)}>返回</Button>
          <Button color="primary" onClick={() => setStep(4)}>查看结果</Button>
        </div>
      </div>
    );
  }

  const item = rigidItems[currentIndex];
  if (!item) {
    setCurrentIndex(0);
    return null;
  }

  const currentOverride = taskScores.find(ts => ts.taskId === item.taskId)?.rigidOverrides[item.layerId];
  const selectedType = currentOverride !== undefined ? (currentOverride ? 'rigid' : 'flexible') : item.rule.defaultType;

  const progress = ((currentIndex + 1) / rigidItems.length) * 100;

  const handleSelect = (type: 'rigid' | 'flexible') => {
    setRigidOverride(item.taskId, item.layerId, type === 'rigid');
  };

  const handleNext = () => {
    if (currentIndex < rigidItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep(4);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setStep(2);
    }
  };

  const scoreLabel = item.score === 1 ? '部分通过' : '未通过';

  return (
    <div className="page-container">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
        判断 {currentIndex + 1} / {rigidItems.length}
      </div>

      <div className="page-title">刚性还是柔性？</div>
      <div className="page-subtitle">
        你在「{item.taskName}」任务的第{item.layerId}层（{item.rule.shortName}）{scoreLabel}。
        <br />我们需要判断这个壁垒是刚性的（无法被改造）还是柔性的（可能被组织/技术改造）。
      </div>

      <div className="funnel-layer" style={{ borderLeft: `3px solid ${selectedType === 'rigid' ? 'var(--color-danger)' : 'var(--color-warning)'}` }}>
        <div className="funnel-layer-header">
          <span className="funnel-layer-icon">{item.rule.defaultType === 'rigid' ? '🔒' : '🔓'}</span>
          <span className="funnel-layer-name">默认判断：{item.rule.defaultType === 'rigid' ? '刚性' : '柔性'}壁垒</span>
        </div>
        <div style={{ fontSize: 13, color: '#666', margin: '8px 0', lineHeight: 1.6 }}>
          {item.rule.defaultReason}
        </div>

        <div className="rigid-question">
          💡 {item.rule.followUpQuestion}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>↗ 升级为刚性的条件：</div>
          <div style={{ fontSize: 13, color: '#ff4d4f', lineHeight: 1.5 }}>{item.rule.upgradeCondition}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>↘ 降级为柔性的条件：</div>
          <div style={{ fontSize: 13, color: '#fa8c16', lineHeight: 1.5 }}>{item.rule.downgradeCondition}</div>
        </div>
      </div>

      <div style={{ margin: '20px 0 12px', fontSize: 15, fontWeight: 600 }}>你的判断：</div>
      <div className="rigid-toggle">
        <div
          className={`rigid-toggle-btn ${selectedType === 'rigid' ? 'selected-rigid' : ''}`}
          onClick={() => handleSelect('rigid')}
        >
          🔒 刚性壁垒
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>不可改造，长期保护</div>
        </div>
        <div
          className={`rigid-toggle-btn ${selectedType === 'flexible' ? 'selected-flexible' : ''}`}
          onClick={() => handleSelect('flexible')}
        >
          🔓 柔性壁垒
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>可能被改造，会消退</div>
        </div>
      </div>

      <div className="bottom-bar">
        <Button onClick={handlePrev}>
          {currentIndex > 0 ? '上一个' : '返回评分'}
        </Button>
        <Button color="primary" onClick={handleNext}>
          {currentIndex < rigidItems.length - 1 ? '下一个' : '查看结果'}
        </Button>
      </div>
    </div>
  );
}