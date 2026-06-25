import { Component, type ReactNode } from 'react';
import { AppProvider, useAppState } from './store';
import JobSelectPage from './pages/JobSelectPage';
import TaskConfirmPage from './pages/TaskConfirmPage';
import FunnelScorePage from './pages/FunnelScorePage';
import RigidJudgePage from './pages/RigidJudgePage';
import ResultPage from './pages/ResultPage';

/** 全局错误边界：防止任何组件崩溃导致白屏 */
class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>页面出错了</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'center', lineHeight: 1.6, maxWidth: 300 }}>
            {this.state.error?.message || '发生了未知错误'}
          </div>
          <button onClick={this.handleReset} style={{
            padding: '8px 24px', borderRadius: 8, border: 'none',
            background: '#1677ff', color: '#fff', fontSize: 14, cursor: 'pointer',
          }}>
            重新开始
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <GlobalErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GlobalErrorBoundary>
  );
}

export default App