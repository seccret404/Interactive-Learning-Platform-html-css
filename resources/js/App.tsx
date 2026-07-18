import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from 'react-router-dom';
import { ProgressProvider } from '@/context/ProgressContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Home } from '@/pages/Home/Home';
import { Module } from '@/pages/Module/Module';
import { Theory } from '@/pages/Theory/Theory';
import { Quiz } from '@/pages/Quiz/Quiz';
import { FinalProject } from '@/pages/FinalProject/FinalProject';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

/**
 * A data router (createBrowserRouter) is used instead of <BrowserRouter> so the
 * Quiz page can call useBlocker to lock navigation until the quiz is submitted.
 */
const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/module/:moduleId', element: <Module /> },
    { path: '/module/:moduleId/theory/:subModuleId', element: <Theory /> },
    { path: '/module/:moduleId/quiz/:subModuleId', element: <Quiz /> },
    { path: '/final-project', element: <FinalProject /> },
    { path: '*', element: <Navigate to="/" replace /> },
]);

export function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ProgressProvider>
                    <RouterProvider router={router} />
                </ProgressProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
