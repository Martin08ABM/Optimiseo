'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorTracker } from '@/src/lib/logger/errorTracker';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log the error
    ErrorTracker.trackError(error, {
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="text-red-400 text-5xl mb-4 text-center" aria-hidden="true">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              Algo salió mal
            </h2>
            <p className="text-gray-400 text-center mb-4">
              Ha ocurrido un error inesperado en la aplicación.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4">
                <summary className="text-sm text-blue-400 cursor-pointer mb-2">
                  Ver detalles técnicos
                </summary>
                <pre className="text-xs text-gray-500 bg-gray-900 p-3 rounded overflow-auto">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recargar página
              </button>
              <a
                href="mailto:soporte@optimiseo.pro"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-center"
              >
                Contactar soporte
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}