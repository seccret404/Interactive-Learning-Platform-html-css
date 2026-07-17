import { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/Button/Button';
import { useCheckAnswer } from '@/hooks/useModules';
import type { IdentifyQuestion, QuizResult } from '@/types';
import { Feedback } from './Feedback';

interface Props {
    question: IdentifyQuestion;
    moduleId: string;
    subModuleId: number;
    index: number;
    passed: boolean;
    onPass: () => void;
}

/** "Click the correct code fragment" question. */
export function IdentifyView({
    question,
    moduleId,
    subModuleId,
    index,
    passed,
    onPass,
}: Props) {
    const [selected, setSelected] = useState<number | null>(null);
    const [result, setResult] = useState<QuizResult | null>(null);
    const check = useCheckAnswer();

    const submit = () => {
        if (selected === null) return;
        check.mutate(
            { moduleId, subModuleId, questionIndex: index, answer: selected },
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

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-3">
                {question.code_parts.map((part, i) => {
                    const active = selected === i;
                    const isRight = passed && active;
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={passed}
                            onClick={() => setSelected(i)}
                            className={[
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-left font-mono text-sm transition-all disabled:cursor-not-allowed',
                                isRight
                                    ? 'bg-emerald-500/20 ring-1 ring-emerald-400'
                                    : active
                                      ? 'bg-brand-500/20 ring-1 ring-brand-400'
                                      : 'hover:bg-slate-800',
                            ].join(' ')}
                        >
                            <span className="select-none text-xs text-slate-500">
                                {i + 1}
                            </span>
                            <code className="text-slate-100">{part}</code>
                            {isRight && (
                                <CheckCircleIcon className="ml-auto h-5 w-5 text-emerald-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            <Feedback result={result} />

            {!passed && (
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        onClick={submit}
                        disabled={selected === null}
                        isLoading={check.isPending}
                    >
                        Periksa Jawaban
                    </Button>
                </div>
            )}
        </div>
    );
}
