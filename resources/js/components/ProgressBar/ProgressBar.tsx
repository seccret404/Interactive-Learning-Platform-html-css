interface ProgressBarProps {
    value: number; // 0 - 100
    showLabel?: boolean;
    className?: string;
}

export function ProgressBar({
    value,
    showLabel = false,
    className = '',
}: ProgressBarProps) {
    const clamped = Math.max(0, Math.min(100, value));

    return (
        <div className={className}>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-[width] duration-500 ease-out"
                    style={{ width: `${clamped}%` }}
                    role="progressbar"
                    aria-valuenow={clamped}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            {showLabel && (
                <p className="mt-1.5 text-xs font-medium text-slate-500">
                    Progress {clamped}%
                </p>
            )}
        </div>
    );
}
