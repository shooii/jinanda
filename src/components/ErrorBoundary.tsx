import { Component, type ErrorInfo, type ReactNode } from "react"
import { AppButton } from "@/components/AppButton"
import { reportError } from "@/lib/errors"

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * 顶层错误边界：渲染期异常不再变成白屏，而是给出可恢复的界面，
 * 同时把异常交给统一上报。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, "react", { componentStack: info.componentStack ?? "" })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="crash-screen" role="alert">
        <div className="crash-card">
          <span className="eyebrow">界面异常</span>
          <h1>出了点问题</h1>
          <p>
            当前界面遇到了未预期的错误。你的本地记录不会丢失，重新加载通常即可恢复。
          </p>
          <pre className="crash-detail">{error.message}</pre>
          <div className="crash-actions">
            <AppButton onClick={() => this.setState({ error: null })}>
              返回上一屏
            </AppButton>
            <AppButton
              className="onboarding-cta"
              onClick={() => window.location.reload()}
            >
              重新加载
            </AppButton>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
