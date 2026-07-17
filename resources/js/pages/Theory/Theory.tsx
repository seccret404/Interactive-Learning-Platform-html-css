import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowLongLeftIcon,
} from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Slide } from '@/components/Slide/Slide';
import { Loading, ErrorState, EmptyState } from '@/components/common/States';
import { useModule } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';

export function Theory() {
    const { moduleId, subModuleId } = useParams<{
        moduleId: string;
        subModuleId: string;
    }>();
    const navigate = useNavigate();
    const { setCurrent } = useProgress();

    const { data: module, isLoading, isError, refetch } = useModule(moduleId);
    const [index, setIndex] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);

    if (isLoading) {
        return (
            <AppLayout>
                <Loading />
            </AppLayout>
        );
    }

    const subId = Number(subModuleId);
    const subModule = module?.subModules.find((s) => s.id === subId);

    if (isError || !module || !subModule) {
        return (
            <AppLayout>
                <ErrorState
                    title="Materi tidak ditemukan"
                    onRetry={() => refetch()}
                />
            </AppLayout>
        );
    }

    const slides = subModule.slides ?? [];

    if (slides.length === 0) {
        return (
            <AppLayout>
                <EmptyState title="Belum ada materi untuk sub-modul ini." />
            </AppLayout>
        );
    }

    const isLast = index === slides.length - 1;
    const isFirst = index === 0;

    const startQuiz = () => {
        if (moduleId) setCurrent(moduleId, subId);
        navigate(`/module/${moduleId}/quiz/${subId}`);
    };

    return (
        <AppLayout>
            <Link
                to={`/module/${moduleId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
            >
                <ArrowLeftIcon className="h-4 w-4" /> {module.title}
            </Link>

            <div className="mt-5 flex flex-col rounded-3xl border border-slate-100 bg-white p-7 shadow-sm sm:p-10">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    {subModule.title}
                </span>

                {/* Re-key on index so the slide entrance animation replays. */}
                <div className="mt-3 min-h-[220px]" key={index}>
                    <Slide slide={slides[index]} />
                </div>

                {/* Slide indicator dots */}
                <div className="mt-8 flex items-center justify-center gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            aria-label={`Slide ${i + 1}`}
                            onClick={() => setIndex(i)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                i === index
                                    ? 'w-6 bg-brand-600'
                                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                            }`}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                    <Button
                        variant="secondary"
                        onClick={() => setIndex((i) => Math.max(0, i - 1))}
                        disabled={isFirst}
                        leftIcon={<ArrowLongLeftIcon className="h-4 w-4" />}
                    >
                        Prev
                    </Button>

                    <span className="text-sm font-medium text-slate-400">
                        {index + 1} / {slides.length}
                    </span>

                    {isLast ? (
                        <Button
                            variant="success"
                            onClick={() => setConfirmOpen(true)}
                            rightIcon={<AcademicCapIcon className="h-4 w-4" />}
                        >
                            Take Quiz
                        </Button>
                    ) : (
                        <Button
                            onClick={() =>
                                setIndex((i) => Math.min(slides.length - 1, i + 1))
                            }
                            rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                        >
                            Next
                        </Button>
                    )}
                </div>
            </div>

            <Modal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Apakah kamu siap mengerjakan quiz?"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={startQuiz}>
                            Start Quiz
                        </Button>
                    </>
                }
            >
                Setelah quiz dimulai, kamu tidak dapat kembali ke materi hingga quiz
                selesai.
            </Modal>
        </AppLayout>
    );
}
