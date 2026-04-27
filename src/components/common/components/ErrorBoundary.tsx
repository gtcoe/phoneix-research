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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 40,
          gap: 16,
        }}
      >
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div
          style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}
        >
          {this.props.pageName
            ? `${this.props.pageName} failed to render`
            : "Something went wrong"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            maxWidth: 480,
            textAlign: "center",
          }}
        >
          {this.state.message}
        </div>
        <button
          onClick={this.reset}
          style={{
            marginTop: 8,
            padding: "8px 20px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      </div>
    );
  }
}
