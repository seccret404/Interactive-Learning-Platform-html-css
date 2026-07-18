interface ProgressRingProps {
    /** 0–100. */
    value: number;
    size?: number;
    stroke?: number;
    /** Tailwind text-* colour class for the progress arc. */
    colorClass?: string;
    /** Tailwind text-* colour class for the track. */
    trackClass?: string;
    /** Optional label override; defaults to "NN%". */
    label?: string;
    labelClass?: string;
}

/** Circular progress indicator drawn with SVG strokes. */
export function ProgressRing({
    value,
    size = 96,
    stroke = 9,
    colorClass = 'text-brand-500',
    trackClass = 'text-slate-200',
    label,
    labelClass = 'text-white',
}: ProgressRingProps) {
    const clamped = Math.max(0, Math.min(100, value));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (clamped / 100) * c;

    return (
        <div className="relative inline-flex" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={stroke}
                    className={trackClass}
                    stroke="currentColor"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className={`${colorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
                    stroke="currentColor"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                />
            </svg>
            <span
                className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${labelClass}`}
            >
                {label ?? `${Math.round(clamped)}%`}
            </span>
        </div>
    );
}
