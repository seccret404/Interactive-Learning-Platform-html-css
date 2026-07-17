import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/Button/Button';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { QuestionView } from '@/components/questions/QuestionView';
import { Loading, ErrorState } from '@/components/common/States';
import { useModule, useModules } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';

const QUESTION_KIND: Record<string, string> = {
    multiple_choice: 'Pilihan Ganda',
    identify: 'Identifikasi Kode',
    fill_code: 'Melengkapi Kode',
    editor: 'Latihan Editor',
};

export function Quiz() {
    const { moduleId, subModuleId } = useParams<{
        moduleId: string;
        subModuleId: string;
    }>();
    const navigate = useNavigate();
    const subId = Number(subModuleId);

    const { data: module, isLoading, isError, refetch } = useModule(moduleId);
    const { data: modules } = useModules();
    const { completeSubModule } = useProgress();

    const subModule = module?.subModules.find((s) => s.id === subId);
    const questions = useMemo(() => subModule?.quiz?.questions ?? [], [subModule]);

    const [passed, setPassed] = useState<boolean[]>([]);
    const [current, setCurrent] = useState(0);
    const [done, setDone] = useState(false);

    // (Re)initialise the passed-flags when the question set changes.
    useEffect(() => {
        setPassed(Array(questions.length).fill(false));
        setCurrent(0);
        setDone(false);
    }, [questions.length, subId, moduleId]);

    const allPassed =
        questions.length > 0 && passed.length === questions.length && passed.every(Boolean);

    // When every question is solved, mark the sub-module complete and return.
    useEffect(() => {
        if (!allPassed || done || !moduleId || !module) return;
        setDone(true);
        completeSubModule(moduleId, subId, modules ?? [module]);
        const t = setTimeout(() => navigate(`/module/${moduleId}`), 1600);
        return () => clearTimeout(t);
    }, [allPassed, done, moduleId, module, modules, subId, completeSubModule, navigate]);

    if (isLoading) {
        return (
            <AppLayout showHeader={false}>
                <Loading label="Menyiapkan quiz..." />
            </AppLayout>
        );
    }

    if (isError || !module || !subModule || questions.length === 0 || !moduleId) {
        return (
            <AppLayout>
                <ErrorState title="Quiz tidak ditemukan" onRetry={() => refetch()} />
            </AppLayout>
        );
    }

    const question = questions[current];
    const currentPassed = passed[current] ?? false;
    const isLast = current === questions.length - 1;
    const solvedCount = passed.filter(Boolean).length;

    const markPassed = () =>
        setPassed((prev) => {
            const next = [...prev];
            next[current] = true;
            return next;
        });

    return (
        <AppLayout showHeader={false}>
            <header className="mb-5 animate-fade-in">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                            {module.title} · {QUESTION_KIND[question.type] ?? 'Quiz'}
                        </span>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            {subModule.title}
                        </h1>
                    </div>
                    {done ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700 animate-pop">
                            <CheckBadgeIcon className="h-5 w-5" /> Selesai! Mengalihkan...
                        </span>
                    ) : (
                        <span className="text-sm font-medium text-slate-500">
                            Soal {current + 1} dari {questions.length}
                        </span>
                    )}
                </div>
                <ProgressBar value={(solvedCount / questions.length) * 100} />
            </header>

            <section className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <QuestionView
                    key={current}
                    question={question}
                    moduleId={moduleId}
                    subModuleId={subId}
                    index={current}
                    passed={currentPassed}
                    onPass={markPassed}
                />
            </section>

            {currentPassed && !isLast && (
                <div className="mt-5 flex justify-end animate-fade-in">
                    <Button
                        variant="primary"
                        onClick={() => setCurrent((c) => c + 1)}
                        rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                        Lanjut
                    </Button>
                </div>
            )}
        </AppLayout>
    );
}
