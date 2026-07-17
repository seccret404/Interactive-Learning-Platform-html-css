import { useState } from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface HintCardProps {
    hint: string;
}

/** Collapsible hint so learners can try first, then reveal help. */
export function HintCard({ hint }: HintCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 text-amber-700"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">
                        Hint
                    </span>
                </span>
                <span className="text-xs font-medium">
                    {open ? 'Sembunyikan' : 'Tampilkan'}
                </span>
            </button>
            {open && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-amber-900 animate-fade-in">
                    {hint}
                </p>
            )}
        </section>
    );
}
