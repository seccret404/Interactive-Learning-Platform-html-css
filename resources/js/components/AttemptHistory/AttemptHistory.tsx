import { ClockIcon } from '@heroicons/react/24/outline';
import type { Attempt } from '@/types';

interface AttemptHistoryProps {
    attempts: Attempt[];
}

/** Chronological list of Run attempts for the current quiz. */
export function AttemptHistory({ attempts }: AttemptHistoryProps) {
    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
                <ClockIcon className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Attempt History
                </h3>
            </div>

            {attempts.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">
                    Belum ada percobaan. Tekan Run untuk mencoba.
                </p>
            ) : (
                <ol className="mt-3 space-y-2">
                    {attempts.map((attempt, index) => (
                        <li
                            key={attempt.id}
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm animate-fade-in"
                        >
                            <span className="font-medium text-slate-700">
                                Attempt #{index + 1}
                            </span>
                            <span className="text-xs text-slate-400">{attempt.time}</span>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    attempt.correct
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                {attempt.correct ? 'Correct' : 'Wrong'}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
