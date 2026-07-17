import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@/components/common/States';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    message?: string;
}

/**
 * Catches render-time errors anywhere in the tree and shows a friendly
 * fallback instead of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // In a real app this would go to a logging service.
        console.error('Uncaught error:', error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, message: undefined });
        window.location.assign('/');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <ErrorState
                        title="Aplikasi mengalami masalah"
                        description={
                            this.state.message ??
                            'Silakan muat ulang halaman atau kembali ke beranda.'
                        }
                        onRetry={this.handleReset}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
