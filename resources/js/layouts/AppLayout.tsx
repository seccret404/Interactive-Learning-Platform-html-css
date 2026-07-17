import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

interface AppLayoutProps {
    children: ReactNode;
    /** When false, hides the top navigation (e.g. focus mode during a quiz). */
    showHeader?: boolean;
}

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            {showHeader && (
                <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3.5 sm:px-6">
                        <Link to="/" className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                                <AcademicCapIcon className="h-5 w-5" />
                            </span>
                            <span className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                                Interactive Learning Platform
                            </span>
                        </Link>
                    </div>
                </header>
            )}
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
        </div>
    );
}
