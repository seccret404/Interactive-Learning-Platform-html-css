import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ProgressProvider } from '@/context/ProgressContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppRoutes } from '@/router/AppRoutes';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ProgressProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </ProgressProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
