import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import type { QuizResult } from '@/types';

interface FeedbackProps {
    result: QuizResult | null;
}

/**
 * Correct/wrong banner shown after a question is checked. Reused by every
 * non-editor question type; the editor uses OutputPanel instead.
 */
export function Feedback({ result }: FeedbackProps) {
    if (!result) return null;

    const tone = result.correct
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

    return (
        <div
            className={`animate-fade-in flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${tone}`}
            role="status"
        >
            {result.correct ? (
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
                <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            )}
            <div>
                <p className="font-semibold">
                    {result.correct ? 'Benar!' : 'Belum tepat'}
                </p>
                {result.feedback && <p className="mt-0.5">{result.feedback}</p>}
            </div>
        </div>
    );
}
