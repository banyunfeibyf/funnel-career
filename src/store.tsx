import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FunnelScore } from './data/funnelLayers';
import type { Task, JobTemplate } from './data/jobTemplates';
import type { JobAnalysis } from './data/analysisEngine';

/** 用户对某个任务的6层漏斗评分 */
export interface TaskScores {
  taskId: string;
  scores: Record<number, FunnelScore>; // layerId -> score
  rigidOverrides: Record<number, boolean>; // layerId -> isRigid (用户覆盖默认)
}

/** 全局状态 */
export interface AppState {
  currentStep: number; // 0=选择岗位, 1=确认任务, 2=漏斗评分, 3=刚性判断, 4=查看结果
  selectedJob: JobTemplate | null;
  /** 用户选中的任务（多选） */
  selectedTaskIds: Set<string>;
  /** 用户自定义后的任务列表（含时间占比调整） */
  customTasks: Task[];
  taskScores: TaskScores[];
  jobAnalysis: JobAnalysis | null;
}

const defaultState: AppState = {
  currentStep: 0,
  selectedJob: null,
  selectedTaskIds: new Set(),
  customTasks: [],
  taskScores: [],
  jobAnalysis: null,
};

interface AppContextType {
  state: AppState;
  setStep: (step: number) => void;
  selectJob: (job: JobTemplate) => void;
  toggleTask: (taskId: string) => void;
  updateTaskRatio: (taskId: string, ratio: number) => void;
  normalizeRatios: () => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setTaskScore: (taskId: string, layerId: number, score: FunnelScore) => void;
  setRigidOverride: (taskId: string, layerId: number, isRigid: boolean) => void;
  setJobAnalysis: (analysis: JobAnalysis) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step, jobAnalysis: step === 4 ? prev.jobAnalysis : null }));
  }, []);

  const selectJob = useCallback((job: JobTemplate) => {
    const allTaskIds = new Set(job.tasks.map(t => t.id));
    const taskScores: TaskScores[] = job.tasks.map(task => ({
      taskId: task.id,
      scores: Object.fromEntries(task.funnelScores.map(fs => [fs.layerId, fs.score])),
      rigidOverrides: Object.fromEntries(
        task.funnelScores.filter(fs => fs.isRigid !== undefined).map(fs => [fs.layerId, fs.isRigid!])
      ),
    }));
    setState(prev => ({
      ...prev,
      selectedJob: job,
      selectedTaskIds: allTaskIds,
      customTasks: job.tasks.map(t => ({ ...t })),
      taskScores,
      jobAnalysis: null,
      currentStep: 1,
    }));
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setState(prev => {
      const newSet = new Set(prev.selectedTaskIds);
      if (newSet.has(taskId)) {
        if (newSet.size <= 1) return prev; // 至少保留1个任务
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return { ...prev, selectedTaskIds: newSet, jobAnalysis: null };
    });
  }, []);

  const updateTaskRatio = useCallback((taskId: string, ratio: number) => {
    setState(prev => ({
      ...prev,
      customTasks: prev.customTasks.map(t =>
        t.id === taskId ? { ...t, timeRatio: ratio } : t
      ),
      jobAnalysis: null,
    }));
  }, []);

  const normalizeRatios = useCallback(() => {
    setState(prev => {
      const selectedTasks = prev.customTasks.filter(t => prev.selectedTaskIds.has(t.id));
      const total = selectedTasks.reduce((sum, t) => sum + t.timeRatio, 0);
      if (total === 0) return prev;
      const scale = 100 / total;
      return {
        ...prev,
        customTasks: prev.customTasks.map(t =>
          prev.selectedTaskIds.has(t.id)
            ? { ...t, timeRatio: Math.round(t.timeRatio * scale) }
            : t
        ),
      };
    });
  }, []);

  const addTask = useCallback((task: Task) => {
    setState(prev => ({
      ...prev,
      customTasks: [...prev.customTasks, task],
      selectedTaskIds: new Set([...prev.selectedTaskIds, task.id]),
      taskScores: [...prev.taskScores, {
        taskId: task.id,
        scores: Object.fromEntries(task.funnelScores.map(fs => [fs.layerId, fs.score])),
        rigidOverrides: Object.fromEntries(
          task.funnelScores.filter(fs => fs.isRigid !== undefined).map(fs => [fs.layerId, fs.isRigid!])
        ),
      }],
      jobAnalysis: null,
    }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setState(prev => {
      const newSet = new Set(prev.selectedTaskIds);
      newSet.delete(taskId);
      return {
        ...prev,
        customTasks: prev.customTasks.filter(t => t.id !== taskId),
        selectedTaskIds: newSet,
        taskScores: prev.taskScores.filter(ts => ts.taskId !== taskId),
        jobAnalysis: null,
      };
    });
  }, []);

  const setTaskScore = useCallback((taskId: string, layerId: number, score: FunnelScore) => {
    setState(prev => {
      const existing = prev.taskScores.find(ts => ts.taskId === taskId);
      if (existing) {
        return {
          ...prev,
          taskScores: prev.taskScores.map(ts =>
            ts.taskId === taskId
              ? { ...ts, scores: { ...ts.scores, [layerId]: score } }
              : ts
          ),
          jobAnalysis: null,
        };
      } else {
        return {
          ...prev,
          taskScores: [...prev.taskScores, { taskId, scores: { [layerId]: score }, rigidOverrides: {} }],
          jobAnalysis: null,
        };
      }
    });
  }, []);

  const setRigidOverride = useCallback((taskId: string, layerId: number, isRigid: boolean) => {
    setState(prev => {
      const existing = prev.taskScores.find(ts => ts.taskId === taskId);
      if (existing) {
        return {
          ...prev,
          taskScores: prev.taskScores.map(ts =>
            ts.taskId === taskId
              ? { ...ts, rigidOverrides: { ...ts.rigidOverrides, [layerId]: isRigid } }
              : ts
          ),
          jobAnalysis: null,
        };
      } else {
        return {
          ...prev,
          taskScores: [...prev.taskScores, { taskId, scores: {}, rigidOverrides: { [layerId]: isRigid } }],
          jobAnalysis: null,
        };
      }
    });
  }, []);

  const setJobAnalysis = useCallback((analysis: JobAnalysis) => {
    setState(prev => ({ ...prev, jobAnalysis: analysis }));
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      setStep,
      selectJob,
      toggleTask,
      updateTaskRatio,
      normalizeRatios,
      addTask,
      removeTask,
      setTaskScore,
      setRigidOverride,
      setJobAnalysis,
      reset,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}