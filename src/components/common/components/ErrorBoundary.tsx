"use client";
import React from "react";

interface Props {
  /** Identifies which page failed — shown in the fallback card */
  pageName?: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Page-level error boundary.
 * Catches any render / useEffect error in the wrapped page and shows a clean
 * fallback card instead of crashing the whole SPA shell.
 *
 * Usage (in PhoenixApp renderPage):
 *   <ErrorBoundary pageName="Dashboard"><Dashboard data={data} /></ErrorBoundary>
 *
 * To reset (e.g., after navigating to a different tab) pass a unique `key`
 * that changes when the page changes — React will unmount + remount the boundary.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // In production this is where you'd send to Sentry / LogRocket
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center h-full p-10 gap-4">
        <div className="text-4xl">⚠️</div>
        <div className="text-base font-bold text-[var(--text)]">
          {this.props.pageName
            ? `${this.props.pageName} failed to render`
            : "Something went wrong"}
        </div>
        <div className="text-xs text-[var(--muted)] font-[var(--font-mono)] max-w-[480px] text-center">
          {this.state.message}
        </div>
        <button
          type="button"
          onClick={this.reset}
          className="mt-2 py-2 px-5 bg-[var(--accent)] text-white border-0 rounded-lg cursor-pointer text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }
}
