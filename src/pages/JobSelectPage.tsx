import { useState } from 'react';
import { useAppState } from '../store';
import { JOB_TEMPLATES, type JobTemplate, type Task } from '../data/jobTemplates';

/** 自定义岗位创建弹窗 */
function CustomJobModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (job: JobTemplate) => void;
}) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [taskInput, setTaskInput] = useState('');

  const handleCreate = () => {
    if (!name.trim() || !taskInput.trim()) return;

    const taskNames = taskInput.split('\n').map(t => t.trim()).filter(Boolean);
    if (taskNames.length === 0) return;

    const evenRatio = Math.round(100 / taskNames.length);
    const tasks: Task[] = taskNames.map((tName, i) => ({
      id: `custom-${Date.now()}-${i}`,
      name: tName,
      timeRatio: i === 0 ? 100 - evenRatio * (taskNames.length - 1) : evenRatio,
      description: tName,
      funnelScores: [
        { layerId: 1, score: 1 },
        { layerId: 2, score: 1 },
        { layerId: 3, score: 0 },
        { layerId: 4, score: 0 },
        { layerId: 5, score: 0 },
        { layerId: 6, score: 0 },
      ],
    }));

    const job: JobTemplate = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      industry: industry.trim() || '自定义',
      icon: '✏️',
      description: '自定义岗位',
      tasks,
    };

    onCreate(job);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">自定义岗位</div>

        <label className="modal-label">岗位名称 *</label>
        <input
          className="modal-input"
          placeholder="例如：心理咨询师"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label className="modal-label">行业（选填）</label>
        <input
          className="modal-input"
          placeholder="例如：医疗"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
        />

        <label className="modal-label">任务列表 *（每行一个任务）</label>
        <textarea
          className="modal-textarea"
          placeholder={"客户咨询与倾听\n方案制定与反馈\n案例记录与归档\n继续教育与培训"}
          rows={6}
          value={taskInput}
          onChange={e => setTaskInput(e.target.value)}
        />
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
          每行一个任务名称，时间占比在下一步调整。默认6层评分均为"中性"，你稍后修改。
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>取消</button>
          <button
            className="modal-btn-confirm"
            disabled={!name.trim() || !taskInput.trim()}
            onClick={handleCreate}
          >
            创建岗位
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobSelectPage() {
  const { selectJob } = useAppState();
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomCreate = (job: JobTemplate) => {
    selectJob(job);
    setShowCustom(false);
  };

  return (
    <div className="page-container">
      <div className="page-title">你的岗位是什么？</div>
      <div className="page-subtitle">
        选择一个最接近的岗位，我们将基于该岗位的典型任务进行分析。
        <br />也可以自定义岗位，输入你的任务列表。
      </div>

      {JOB_TEMPLATES.map(job => (
        <div
          key={job.id}
          className="job-card"
          onClick={() => selectJob(job)}
        >
          <div className="job-card-icon">{job.icon}</div>
          <div className="job-card-info">
            <div className="job-card-name">{job.name}</div>
            <div className="job-card-industry">{job.industry}</div>
            <div className="job-card-desc">{job.description}</div>
          </div>
        </div>
      ))}

      {/* 自定义岗位入口 */}
      <div
        className="job-card job-card-custom"
        onClick={() => setShowCustom(true)}
      >
        <div className="job-card-icon">✏️</div>
        <div className="job-card-info">
          <div className="job-card-name">自定义岗位</div>
          <div className="job-card-desc">找不到你的岗位？输入岗位名和任务列表</div>
        </div>
      </div>

      {showCustom && (
        <CustomJobModal
          onClose={() => setShowCustom(false)}
          onCreate={handleCustomCreate}
        />
      )}
    </div>
  );
}