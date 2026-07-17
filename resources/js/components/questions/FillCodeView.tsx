import { useMemo, useState } from 'react';
import { Button } from '@/components/Button/Button';
import { useCheckAnswer } from '@/hooks/useModules';
import type { FillCodeQuestion, QuizResult } from '@/types';
import { Feedback } from './Feedback';

interface Props {
    question: FillCodeQuestion;
    moduleId: string;
    subModuleId: number;
    index: number;
    passed: boolean;
    onPass: () => void;
}

const MARKER = /(\[\[\d+\]\])/g;
const BLANK_INDEX = /\[\[(\d+)\]\]/;

/**
 * Fill-in-the-code question. The template embeds blank markers like `[[0]]`;
 * each unique index becomes an inline input. Answers are sent as an array
 * ordered by blank index.
 */
export function FillCodeView({
    question,
    moduleId,
    subModuleId,
    index,
    passed,
    onPass,
}: Props) {
    const [values, setValues] = useState<Record<number, string>>({});
    const [result, setResult] = useState<QuizResult | null>(null);
    const check = useCheckAnswer();

    const { segments, blankCount } = useMemo(() => {
        const segs = question.template.split(MARKER);
        let max = -1;
        for (const seg of segs) {
            const m = seg.match(BLANK_INDEX);
            if (m) max = Math.max(max, Number(m[1]));
        }
        return { segments: segs, blankCount: max + 1 };
    }, [question.template]);

    const allFilled = Array.from({ length: blankCount }).every(
        (_, i) => (values[i] ?? '').trim() !== '',
    );

    const submit = () => {
        const answer = Array.from({ length: blankCount }, (_, i) => values[i] ?? '');
        check.mutate(
            { moduleId, subModuleId, questionIndex: index, answer },
            {
                onSuccess: (res) => {
                    setResult(res);
                    if (res.correct) onPass();
                },
            },
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-base font-semibold leading-relaxed text-slate-900">
                {question.prompt}
            </p>

            <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-900 p-4 font-mono text-sm leading-7 text-slate-100">
                {segments.map((seg, i) => {
                    const m = seg.match(BLANK_INDEX);
                    if (m) {
                        const blankIdx = Number(m[1]);
                        return (
                            <input
                                key={i}
                                type="text"
                                disabled={passed}
                                value={values[blankIdx] ?? ''}
                                onChange={(e) =>
                                    setValues((v) => ({ ...v, [blankIdx]: e.target.value }))
                                }
                                aria-label={`Isian ${blankIdx + 1}`}
                                className="mx-1 w-24 rounded-md border border-brand-400 bg-slate-800 px-2 py-0.5 text-center font-mono text-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-70"
                            />
                        );
                    }
                    return <span key={i}>{seg}</span>;
                })}
            </pre>

            <Feedback result={result} />

            {!passed && (
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        onClick={submit}
                        disabled={!allFilled}
                        isLoading={check.isPending}
                    >
                        Periksa Jawaban
                    </Button>
                </div>
            )}
        </div>
    );
}
