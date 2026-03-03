'use client';

import { Component, type ReactNode } from 'react';
import { CosmicButton } from '@gitverse/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0f] p-4">
          <div className="text-5xl">💥</div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="max-w-md text-center text-sm text-white/50">
            The galaxy encountered a singularity. This error has been logged.
          </p>
          {this.state.error && (
            <pre className="max-w-lg overflow-auto rounded-lg bg-white/5 p-3 text-xs text-red-400">
              {this.state.error.message}
            </pre>
          )}
          <CosmicButton
            variant="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Restart Galaxy
          </CosmicButton>
        </div>
      );
    }

    return this.props.children;
  }
}
