import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div style={{ padding: 20, color: '#ff6b6b', background: '#2d2d2d', borderRadius: 4 }}>
                    <h3>Wystąpił błąd renderowania</h3>
                    <p>{this.state.error?.message}</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{ padding: '8px 16px', marginTop: 10, cursor: 'pointer' }}
                    >
                        Spróbuj ponownie
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
