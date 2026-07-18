interface LogoProps {
    /** Show the wordmark text next to the mark. */
    withText?: boolean;
    className?: string;
}

/**
 * BeringinCode / B-Code brand mark: a rounded tile with a `</>` glyph in a
 * warm coral→green gradient (echoing the "beringin" tree + code identity).
 */
export function Logo({ withText = true, className = '' }: LogoProps) {
    return (
        <span className={`flex items-center gap-2.5 ${className}`}>
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-html-500 to-success-500 text-white shadow-sm">
                <span className="font-mono text-[13px] font-bold leading-none tracking-tight">
                    &lt;/&gt;
                </span>
            </span>
            {withText && (
                <span className="text-base font-bold tracking-tight text-ink">
                    Beringin<span className="text-html-600">Code</span>
                </span>
            )}
        </span>
    );
}
