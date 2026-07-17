import type { ReactNode } from 'react';
import {
    ExclamationTriangleIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/Button/Button';

/** Centered spinner for loading states. */
export function Loading({ label = 'Memuat...' }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 animate-fade-in">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
            <p className="text-sm font-medium">{label}</p>
        </div>
    );
}

/** Empty-state placeholder. */
export function EmptyState({
    title = 'Belum ada data',
    description,
    icon,
}: {
    title?: string;
    description?: string;
    icon?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center animate-fade-in">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                {icon ?? <InboxIcon className="h-8 w-8" />}
            </div>
            <h3 className="text-base font-semibold text-slate-700">{title}</h3>
            {description && (
                <p className="max-w-sm text-sm text-slate-500">{description}</p>
            )}
        </div>
    );
}

/** Error-state placeholder with optional retry. */
export function ErrorState({
    title = 'Terjadi kesalahan',
    description,
    onRetry,
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center animate-fade-in">
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-500">
                <ExclamationTriangleIcon className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">{title}</h3>
            {description && (
                <p className="max-w-sm text-sm text-slate-500">{description}</p>
            )}
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Coba lagi
                </Button>
            )}
        </div>
    );
}
