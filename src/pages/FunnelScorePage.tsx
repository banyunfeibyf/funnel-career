import { useState, useEffect } from 'react';
import { useAppState } from '../store';
import { FUNNEL_LAYERS } from '../data/funnelLayers';
import type { FunnelScore } from '../data/funnelLayers';
import { Button } from 'antd-mobile';

export default function FunnelScorePage() {
  const { state, setStep, setTaskScore } = useAppState();
  const { customTasks, taskScores, selectedTaskIds } = state;

  // 只显示选中的任务
  const activeTasks = customTasks.filter(t => selectedTaskIds.has(t.id));
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // 当step切回时重置index
  useEffect(() => {
    setCurrentTaskIndex(0);
  }, [selectedTaskIds]);

  if (activeTasks.length === 0) {
    return (
      <div className="page-container">
        <div className="page-title">没有选中的任务</div>
        <div className="page-subtitle">请返回上一步选择至少一个任务。</div>
        <div className="bottom-bar">
          <Button onClick={() => setStep(1)}>返回</Button>
        </div>
      </div>
    );
  }

  const currentTask = activeTasks[currentTaskIndex];
  if (!currentTask) {
    setCurrentTaskIndex(0);
    return null;
  }
  const currentScores = taskScores.find(ts => ts.taskId === currentTask.id);
  const progress = ((currentTaskIndex + 1) / activeTasks.length) * 100;

  const handleSelect = (layerId: number, score: FunnelScore) => {
    setTaskScore(currentTask.id, layerId, score);
  };

  const handleNext = () => {
    const scores = taskScores.find(ts => ts.taskId === currentTask.id);
    if (!scores || Object.keys(scores.scores).length < 6) {
      return; // 未完成评分
    }
    if (currentTaskIndex < activeTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      setStep(3); // 进入刚性判断页
    }
  };

  const handlePrev = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    } else {
      setStep(1);
    }
  };

  const allScored = currentScores && Object.keys(currentScores.scores).length >= 6;

  return (
    <div className="page-container">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
        任务 {currentTaskIndex + 1} / {activeTasks.length} · {currentTask.timeRatio}%工作时间
      </div>

      <div className="page-title">{currentTask.name}</div>
      <div className="page-subtitle">{currentTask.description}</div>

      {FUNNEL_LAYERS.map(layer => {
        const selectedScore = currentScores?.scores[layer.id];
        return (
          <div key={layer.id} className="funnel-layer">
            <div className="funnel-layer-header">
              <span className="funnel-layer-icon">{layer.icon}</span>
              <span className="funnel-layer-name">第{layer.id}层 · {layer.shortName}</span>
            </div>
            <div className="funnel-layer-question">{layer.question}</div>
            <div className="funnel-options">
              {layer.options.map(option => (
                <div
                  key={option.score}
                  className={`funnel-option ${selectedScore === option.score ? 'selected' : ''}`}
                  onClick={() => handleSelect(layer.id, option.score)}
                >
                  <div className="funnel-option-radio" />
                  <div className="funnel-option-content">
                    <div className="funnel-option-label">{option.label}</div>
                    <div className="funnel-option-desc">{option.shortDesc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bottom-bar">
        <Button onClick={handlePrev}>
          {currentTaskIndex > 0 ? '上一任务' : '返回'}
        </Button>
        <Button
          color="primary"
          onClick={handleNext}
          disabled={!allScored}
        >
          {currentTaskIndex < activeTasks.length - 1 ? '下一任务' : '完成评分'}
        </Button>
      </div>
    </div>
  );
}