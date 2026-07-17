import { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/Button/Button';
import { useCheckAnswer } from '@/hooks/useModules';
import type { MultipleChoiceQuestion, QuizResult } from '@/types';
import { Feedback } from './Feedback';

interface Props {
    question: MultipleChoiceQuestion;
    moduleId: string;
    subModuleId: number;
    index: number;
    passed: boolean;
    onPass: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** A single-answer multiple-choice question. */
export function MultipleChoiceView({
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
                {question.question}
            </p>

            <div className="flex flex-col gap-2.5">
                {question.options.map((option, i) => {
                    const active = selected === i;
                    const isRight = passed && active;
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={passed}
                            onClick={() => setSelected(i)}
                            className={[
                                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                                'disabled:cursor-not-allowed',
                                isRight
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : active
                                      ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    active
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-slate-100 text-slate-500',
                                ].join(' ')}
                            >
                                {OPTION_LABELS[i] ?? i + 1}
                            </span>
                            <span className="text-slate-700">{option}</span>
                            {isRight && (
                                <CheckCircleIcon className="ml-auto h-5 w-5 text-emerald-500" />
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
