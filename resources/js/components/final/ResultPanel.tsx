import {
    CheckCircleIcon,
    XCircleIcon,
    TrophyIcon,
} from '@heroicons/react/24/solid';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import type { FinalProjectResult, GradedCriterion } from '@/types';

/** Groups graded criteria by their rubric aspect, preserving order. */
function groupByAspect(criteria: GradedCriterion[]): [string, GradedCriterion[]][] {
    const order: string[] = [];
    const map = new Map<string, GradedCriterion[]>();
    for (const c of criteria) {
        if (!map.has(c.aspect)) {
            map.set(c.aspect, []);
            order.push(c.aspect);
        }
        map.get(c.aspect)!.push(c);
    }
    return order.map((a) => [a, map.get(a)!]);
}

export function ResultPanel({ result }: { result: FinalProjectResult }) {
    const groups = groupByAspect(result.criteria);
    const toneScore = result.complete
        ? 'text-success-600'
        : result.score >= 70
          ? 'text-project-600'
          : 'text-amber-600';

    return (
        <div className="flex flex-col gap-5 animate-fade-in">
            {/* Score header */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Skor Final Project
                        </p>
                        <p className={`mt-1 text-4xl font-extrabold ${toneScore}`}>
                            {result.score}
                            <span className="text-lg font-semibold text-slate-400">
                                {' '}
                                / {result.maxScore}
                            </span>
                        </p>
                    </div>
                    <span
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                            result.complete
                                ? 'bg-emerald-50 text-emerald-500'
                                : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        <TrophyIcon className="h-7 w-7" />
                    </span>
                </div>
                <ProgressBar value={result.score} className="mt-4" />
                <p className="mt-2 text-xs text-slate-500">
                    {result.passedCount} dari {result.totalCount} indikator terpenuhi
                </p>
            </div>

            {/* Feedback */}
            <div
                className={`rounded-2xl border p-5 text-sm leading-relaxed ${
                    result.complete
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
            >
                {result.feedback}
            </div>

            {/* Aspect breakdown */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Rincian Rubrik</h3>
                <div className="mt-3 space-y-3">
                    {result.aspects.map((a) => (
                        <div key={a.aspect}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-600">
                                    {a.aspect}
                                </span>
                                <span className="font-semibold text-slate-500">
                                    {a.earned}/{a.max}
                                </span>
                            </div>
                            <ProgressBar value={(a.earned / a.max) * 100} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Criteria checklist */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Checklist Indikator</h3>
                <div className="mt-3 space-y-4">
                    {groups.map(([aspect, items]) => (
                        <div key={aspect}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {aspect}
                            </p>
                            <ul className="mt-1.5 space-y-1.5">
                                {items.map((c) => (
                                    <li
                                        key={c.id}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        {c.passed ? (
                                            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                        ) : (
                                            <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                                        )}
                                        <span
                                            className={
                                                c.passed
                                                    ? 'text-slate-700'
                                                    : 'text-slate-400'
                                            }
                                        >
                                            {c.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
