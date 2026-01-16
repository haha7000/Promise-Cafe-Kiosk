/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하여 폴백 UI 표시
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 실제 환경에서는 Sentry 등으로 전송
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
          <div className="bg-[#2D2D2D] rounded-2xl p-8 max-w-md w-full text-center border border-[#3D3D3D]">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">문제가 발생했습니다</h1>
            <p className="text-[#B0B0B0] mb-6">
              일시적인 오류가 발생했습니다.<br />
              잠시 후 다시 시도해주세요.
            </p>
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-sm text-[#6B6B6B] cursor-pointer mb-2">
                  오류 상세 정보
                </summary>
                <pre className="text-xs text-red-400 bg-[#1A1A1A] p-3 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-[#C41E3A] text-white rounded-lg font-bold hover:bg-[#A01830] transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 border border-[#3D3D3D] text-[#B0B0B0] rounded-lg font-bold hover:bg-[#3D3D3D] transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
