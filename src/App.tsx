import { AppProvider, useAppState } from './store';
import JobSelectPage from './pages/JobSelectPage';
import TaskConfirmPage from './pages/TaskConfirmPage';
import FunnelScorePage from './pages/FunnelScorePage';
import RigidJudgePage from './pages/RigidJudgePage';
import ResultPage from './pages/ResultPage';

function AppContent() {
  const { state } = useAppState();

  const steps = ['岗位选择', '任务确认', '漏斗评分', '刚性判断', '分析结果'];

  return (
    <>
      {/* 步骤指示器 */}
      {state.currentStep > 0 && state.currentStep < 4 && (
        <div className="step-indicator">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i === state.currentStep ? 'active' : i < state.currentStep ? 'done' : ''}`}
            />
          ))}
        </div>
      )}

      {/* 页面路由 */}
      {state.currentStep === 0 && <JobSelectPage />}
      {state.currentStep === 1 && <TaskConfirmPage />}
      {state.currentStep === 2 && <FunnelScorePage />}
      {state.currentStep === 3 && <RigidJudgePage />}
      {state.currentStep === 4 && <ResultPage />}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App