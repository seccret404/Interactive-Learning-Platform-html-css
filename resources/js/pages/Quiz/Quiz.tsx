import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import {
    CheckBadgeIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    LockClosedIcon,
    CheckIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/solid';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { QuestionView } from '@/components/questions/QuestionView';
import { Loading, ErrorState } from '@/components/common/States';
import { useModule, useModules } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';
import { accentClasses } from '@/utils/accent';

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
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setPassed(Array(questions.length).fill(false));
        setCurrent(0);
        setSubmitted(false);
    }, [questions.length, subId, moduleId]);

    const allPassed =
        questions.length > 0 && passed.length === questions.length && passed.every(Boolean);

    // Lock navigation while the quiz is unsubmitted: this catches the browser
    // back/forward button and any in-app link. The learner may only move with
    // Prev/Next and must "Kumpulkan Kuis" to leave.
    const blocker = useBlocker(!submitted);

    // Also warn on tab refresh/close.
    useEffect(() => {
        if (submitted) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [submitted]);

    // On submit: record completion and return to the module list.
    useEffect(() => {
        if (!submitted || !moduleId || !module) return;
        completeSubModule(moduleId, subId, modules ?? [module]);
        const t = setTimeout(() => navigate(`/module/${moduleId}`), 1500);
        return () => clearTimeout(t);
    }, [submitted, moduleId, module, modules, subId, completeSubModule, navigate]);

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

    const accent = accentClasses(moduleId);
    const question = questions[current];
    const currentPassed = passed[current] ?? false;
    const isLast = current === questions.length - 1;

    const markPassed = () =>
        setPassed((prev) => {
            const next = [...prev];
            next[current] = true;
            return next;
        });

    return (
        <AppLayout showHeader={false}>
            <header className="mb-5 animate-fade-in">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${accent.text}`}>
                            {module.title} · {QUESTION_KIND[question.type] ?? 'Quiz'}
                        </span>
                        <h1 className="text-xl font-bold tracking-tight text-ink">
                            {subModule.title}
                        </h1>
                    </div>
                    {submitted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1.5 text-sm font-semibold text-success-700 animate-pop">
                            <CheckBadgeIcon className="h-5 w-5" /> Kuis selesai! Mengalihkan...
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                            <LockClosedIcon className="h-3.5 w-3.5" /> Mode Kuis · Soal{' '}
                            {current + 1}/{questions.length}
                        </span>
                    )}
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                    {questions.map((q, i) => {
                        const done = passed[i];
                        const isCurrent = i === current;
                        return (
                            <div key={i} className="flex flex-1 items-center gap-1.5">
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                        done
                                            ? `${accent.solid} text-white`
                                            : isCurrent
                                              ? `bg-white ${accent.text} ring-2 ${accent.ring}`
                                              : 'bg-slate-100 text-slate-400'
                                    }`}
                                    title={QUESTION_KIND[q.type]}
                                >
                                    {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
                                </span>
                                {i < questions.length - 1 && (
                                    <span
                                        className={`h-0.5 flex-1 rounded-full ${
                                            passed[i] ? accent.solid : 'bg-slate-100'
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
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

            {/* Prev / Next / Submit */}
            <div className="mt-5 flex items-center justify-between gap-3 animate-fade-in">
                <Button
                    variant="secondary"
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={current === 0}
                    leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
                >
                    Sebelumnya
                </Button>

                {allPassed ? (
                    <Button
                        variant="success"
                        onClick={() => setSubmitted(true)}
                        disabled={submitted}
                        rightIcon={<PaperAirplaneIcon className="h-4 w-4" />}
                    >
                        Kumpulkan Kuis
                    </Button>
                ) : isLast ? (
                    <span className="text-xs text-slate-400">
                        Jawab semua soal dengan benar untuk mengumpulkan.
                    </span>
                ) : (
                    <Button
                        variant="primary"
                        onClick={() => setCurrent((c) => c + 1)}
                        disabled={!currentPassed}
                        rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                        Berikutnya
                    </Button>
                )}
            </div>

            {/* Navigation-lock prompt */}
            <Modal
                open={blocker.state === 'blocked'}
                onClose={() => blocker.reset?.()}
                title="Kuis sedang berlangsung"
                footer={
                    <Button variant="primary" onClick={() => blocker.reset?.()}>
                        Lanjut Mengerjakan
                    </Button>
                }
            >
                Selesaikan dan kumpulkan kuis ini dulu sebelum berpindah halaman. Kamu
                hanya dapat berpindah antar-soal menggunakan tombol Sebelumnya dan
                Berikutnya.
            </Modal>
        </AppLayout>
    );
}
