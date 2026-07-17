import {
    CheckCircleIcon,
    XCircleIcon,
    CommandLineIcon,
} from '@heroicons/react/24/solid';
import type { QuizResult } from '@/types';

interface OutputPanelProps {
    result: QuizResult | null;
    isRunning: boolean;
}

/** Shows the validation outcome of the latest Run. */
export function OutputPanel({ result, isRunning }: OutputPanelProps) {
    return (
        <section className="flex min-h-[140px] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-100">
            <div className="flex items-center gap-2 text-slate-400">
                <CommandLineIcon className="h-4 w-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wide">
                    Output
                </h3>
            </div>

            <div className="mt-3 flex-1 text-sm">
                {isRunning && (
                    <p className="flex items-center gap-2 text-slate-300 animate-fade-in">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                        Menjalankan validasi...
                    </p>
                )}

                {!isRunning && !result && (
                    <p className="text-slate-500">
                        Tekan <span className="font-semibold text-slate-300">Run</span>{' '}
                        untuk menjalankan dan memeriksa kode kamu.
                    </p>
                )}

                {!isRunning && result && (
                    <div className="animate-fade-in space-y-3">
                        <p
                            className={`flex items-center gap-2 text-base font-semibold ${
                                result.correct ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                        >
                            {result.correct ? (
                                <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                                <XCircleIcon className="h-5 w-5" />
                            )}
                            {result.correct ? 'Correct' : 'Wrong Answer'}
                        </p>

                        {result.results && result.results.length > 0 && (
                            <ul className="space-y-1.5">
                                {result.results.map((r, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs text-slate-300"
                                    >
                                        {r.passed ? (
                                            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                        ) : (
                                            <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                                        )}
                                        <span className={r.passed ? 'line-through opacity-60' : ''}>
                                            {r.message}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
