import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { installGlobalErrorHandlers } from "./lib/errors"
import { registerServiceWorker } from "./lib/pwa"
import "./index.css"

// 先装全局兜底，再挂载应用：挂载前的异常也要能被捕获
installGlobalErrorHandlers()
registerServiceWorker()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
