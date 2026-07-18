import { useEffect, useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/Button/Button';
import { CodeEditor } from '@/components/CodeEditor/CodeEditor';
import { StudyCase } from '@/components/StudyCase/StudyCase';
import { HintCard } from '@/components/HintCard/HintCard';
import { OutputPanel } from '@/components/OutputPanel/OutputPanel';
import { AttemptHistory } from '@/components/AttemptHistory/AttemptHistory';
import { useCheckAnswer } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';
import type { EditorQuestion, QuizResult } from '@/types';

interface Props {
    question: EditorQuestion;
    moduleId: string;
    subModuleId: number;
    index: number;
    passed: boolean;
    onPass: () => void;
}

/** Case-based code editor question, validated against server-side test cases. */
export function EditorView({
    question,
    moduleId,
    subModuleId,
    index,
    passed,
    onPass,
}: Props) {
    const { recordAttempt, attemptsFor, progress } = useProgress();
    const check = useCheckAnswer();

    const [code, setCode] = useState(question.starter_code);
    const [result, setResult] = useState<QuizResult | null>(null);

    // Reset the editor whenever we move to a different editor question.
    useEffect(() => {
        setCode(question.starter_code);
        setResult(null);
    }, [question.starter_code]);

    const attempts = attemptsFor(moduleId, subModuleId);
    const wrong = result !== null && !result.correct && !passed;

    const run = () => {
        check.mutate(
            { moduleId, subModuleId, questionIndex: index, code, theme: progress.theme },
            {
                onSuccess: (res) => {
                    setResult(res);
                    recordAttempt(moduleId, subModuleId, res.correct, code);
                    if (res.correct) onPass();
                },
                onError: () => {
                    setResult({
                        success: false,
                        correct: false,
                        output: 'Gagal terhubung ke server.',
                    });
                },
            },
        );
    };

    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_1fr]">
            <div className="flex flex-col gap-4">
                <StudyCase studyCase={question.study_case} />
                <HintCard hint={question.hint} />
                <AttemptHistory attempts={attempts} />
            </div>

            <div className="flex flex-col gap-4">
                <div className="h-[320px] sm:h-[380px]">
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        language={question.language}
                        readOnly={passed}
                    />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <span
                        className={`text-xs ${wrong ? 'text-rose-500' : 'text-slate-400'}`}
                    >
                        {wrong
                            ? 'Perbaiki kodemu lalu jalankan lagi.'
                            : 'Tulis kode lalu jalankan untuk memeriksa jawaban.'}
                    </span>

                    <Button
                        variant="success"
                        onClick={run}
                        isLoading={check.isPending}
                        disabled={passed}
                        leftIcon={<PlayIcon className="h-4 w-4" />}
                    >
                        Run
                    </Button>
                </div>

                <OutputPanel result={result} isRunning={check.isPending} />
            </div>
        </div>
    );
}
