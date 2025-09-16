import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: any; }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Log minimal diagnostic (peut être remplacé par un service)
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto text-center space-y-4">
          <h1 className="text-xl font-semibold text-red-400">Une erreur est survenue</h1>
          <p className="text-sm text-muted-foreground break-all">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button onClick={this.handleRetry} className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-500">
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
