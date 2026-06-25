import { useState } from 'react';
import { useAppState } from '../store';
import { Button, Slider, Checkbox } from 'antd-mobile';
import type { Task } from '../data/jobTemplates';

/** 添加任务弹窗 */
function AddTaskModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (task: Task) => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    const task: Task = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      timeRatio: 20,
      description: desc.trim() || name.trim(),
      funnelScores: [
        { layerId: 1, score: 1 },
        { layerId: 2, score: 1 },
        { layerId: 3, score: 0 },
        { layerId: 4, score: 0 },
        { layerId: 5, score: 0 },
        { layerId: 6, score: 0 },
      ],
    };
    onAdd(task);
    setName('');
    setDesc('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">添加任务</div>

        <label className="modal-label">任务名称 *</label>
        <input
          className="modal-input"
          placeholder="例如：客户咨询与倾听"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label className="modal-label">任务描述（选填）</label>
        <input
          className="modal-input"
          placeholder="简要描述这个任务的内容"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />

        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          默认时间占比20%，6层评分均为"中性"，可稍后调整。
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>取消</button>
          <button
            className="modal-btn-confirm"
            disabled={!name.trim()}
            onClick={handleAdd}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaskConfirmPage() {
  const { state, setStep, toggleTask, updateTaskRatio, normalizeRatios, addTask, removeTask } = useAppState();
  const { selectedJob, customTasks, selectedTaskIds } = state;
  const [showAddModal, setShowAddModal] = useState(false);

  if (!selectedJob) return null;

  const selectedTasks = customTasks.filter(t => selectedTaskIds.has(t.id));
  const selectedTotal = selectedTasks.reduce((s, t) => s + t.timeRatio, 0);

  const handleNext = () => {
    normalizeRatios();
    setStep(2);
  };

  const handleAddTask = (task: Task) => {
    addTask(task);
  };

  return (
    <div className="page-container">
      <div className="page-title">{selectedJob.icon} {selectedJob.name}的任务</div>
      <div className="page-subtitle">
        勾选你实际工作中包含的任务，调整时间占比。不需要的任务取消勾选或删除，也可以添加新任务。
      </div>

      {customTasks.map(task => {
        const isSelected = selectedTaskIds.has(task.id);
        const isPreset = task.id.startsWith(selectedJob.id) || task.id.startsWith('pm-') || task.id.startsWith('dev-') || task.id.startsWith('ops-') || task.id.startsWith('sales-') || task.id.startsWith('law-') || task.id.startsWith('doc-') || task.id.startsWith('teach-') || task.id.startsWith('acc-') || task.id.startsWith('edit-') || task.id.startsWith('tspm-') || task.id.startsWith('entry-');
        return (
          <div
            key={task.id}
            className="task-card"
            style={{
              opacity: isSelected ? 1 : 0.45,
              borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
            }}
          >
            <div className="task-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleTask(task.id)}
                />
                <div className="task-card-name">{task.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="task-card-ratio">{task.timeRatio}%</div>
                {!isPreset && (
                  <button
                    className="task-delete-btn"
                    onClick={() => removeTask(task.id)}
                    title="删除任务"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="task-card-desc" style={{ marginLeft: 28 }}>{task.description}</div>
            {isSelected && (
              <div style={{ marginTop: 12, marginLeft: 28, paddingRight: 8 }}>
                <Slider
                  value={task.timeRatio}
                  min={5}
                  max={80}
                  step={5}
                  onChange={(val) => {
                    if (typeof val === 'number') {
                      updateTaskRatio(task.id, val);
                    }
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginTop: 4 }}>
                  <span>5%</span>
                  <span>拖动调整占比</span>
                  <span>80%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 添加任务按钮 */}
      <button className="add-task-btn" onClick={() => setShowAddModal(true)}>
        + 添加自定义任务
      </button>

      <div style={{
        textAlign: 'center', marginTop: 8, marginBottom: 8,
        fontSize: 13, color: '#666',
      }}>
        已选 {selectedTaskIds.size} 个任务 · 当前合计 {selectedTotal}%
        {selectedTotal !== 100 && (
          <span style={{ color: selectedTotal > 100 ? '#ff4d4f' : '#fa8c16', marginLeft: 8 }}>
            {selectedTotal > 100 ? '（超出，将自动归一化）' : '（不足100%，将自动归一化）'}
          </span>
        )}
      </div>

      <div className="bottom-bar">
        <Button onClick={() => setStep(0)}>返回选岗</Button>
        <Button color="primary" onClick={handleNext} disabled={selectedTaskIds.size === 0}>
          开始评分
        </Button>
      </div>

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
}