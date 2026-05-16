import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogService } from '../services/errorLogService';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  private handleWindowError = (event: ErrorEvent) => {
    errorLogService.logError({
      message: event.message,
      stack: event.error?.stack,
      severity: 'high'
    });
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    errorLogService.logError({
      message: `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
      stack: event.reason?.stack,
      severity: 'high'
    });
  };

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log to Firestore
    errorLogService.logError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      severity: 'high'
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#161616] border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[100px] rounded-full"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertCircle className="text-red-500" size={40} />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                An unexpected error occurred. We've been notified and are looking into it.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-8 p-4 bg-black/40 rounded-xl border border-white/5 text-left overflow-auto max-h-40">
                  <p className="text-red-400 text-xs font-mono break-all">{this.state.error.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#222222] hover:bg-[#2a2a2a] text-white rounded-xl font-bold text-sm transition-all border border-white/5 shadow-lg active:scale-95"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
                >
                  <Home size={16} />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
