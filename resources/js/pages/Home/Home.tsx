import { useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/Button/Button';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { ModuleIcon } from '@/components/common/ModuleIcon';
import { Loading, ErrorState, EmptyState } from '@/components/common/States';
import { useModules } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';
import {
    isModuleUnlocked,
    isModuleCompleted,
    moduleProgressPercent,
} from '@/utils/progress';
import type { ModuleSummary } from '@/types';

export function Home() {
    const { data: modules, isLoading, isError, refetch } = useModules();
    const { progress, reset } = useProgress();
    const navigate = useNavigate();

    return (
        <AppLayout>
            <section className="animate-slide-up">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                    Belajar Web Dasar
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Kuasai HTML &amp; CSS
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">
                    Pelajari teori lewat slide interaktif, lalu uji pemahamanmu dengan
                    kuis coding. Selesaikan setiap modul untuk membuka modul berikutnya.
                </p>
            </section>

            <div className="mt-8">
                {isLoading && <Loading label="Memuat modul..." />}
                {isError && (
                    <ErrorState
                        description="Gagal memuat daftar modul."
                        onRetry={() => refetch()}
                    />
                )}
                {!isLoading && !isError && modules && modules.length === 0 && (
                    <EmptyState
                        title="Belum ada modul"
                        description="Tambahkan file JSON pada storage/modules untuk memulai."
                    />
                )}

                {!isLoading && !isError && modules && modules.length > 0 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        {modules.map((module, index) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                modules={modules}
                                index={index}
                                onOpen={() => navigate(`/module/${module.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {progress.completedQuiz.length > 0 && (
                <div className="mt-10 flex justify-center">
                    <Button variant="ghost" size="sm" onClick={reset}>
                        Reset progress
                    </Button>
                </div>
            )}
        </AppLayout>
    );
}

function ModuleCard({
    module,
    modules,
    index,
    onOpen,
}: {
    module: ModuleSummary;
    modules: ModuleSummary[];
    index: number;
    onOpen: () => void;
}) {
    const { progress } = useProgress();
    const unlocked = isModuleUnlocked(modules, progress, module.id);
    const completed = isModuleCompleted(module, progress);
    const percent = moduleProgressPercent(module, progress);

    return (
        <div
            className={`group relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 animate-slide-up ${
                unlocked
                    ? 'border-slate-100 hover:-translate-y-1 hover:shadow-md'
                    : 'border-slate-100 opacity-80'
            }`}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <div className="flex items-start justify-between">
                <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        unlocked
                            ? 'bg-brand-50 text-brand-600'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                >
                    <ModuleIcon name={module.icon} className="h-6 w-6" />
                </span>

                {completed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckBadgeIcon className="h-4 w-4" /> Selesai
                    </span>
                ) : !unlocked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        <LockClosedIcon className="h-3.5 w-3.5" /> Locked
                    </span>
                ) : (
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
                        {percent > 0 ? 'In progress' : 'Mulai'}
                    </span>
                )}
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">{module.title}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-500">{module.description}</p>

            <div className="mt-5">
                <ProgressBar value={percent} />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{module.subModules.length} sub-modul</span>
                    <span className="font-medium">{percent}%</span>
                </div>
            </div>

            <div className="mt-5">
                {unlocked ? (
                    <Button
                        fullWidth
                        onClick={onOpen}
                        rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                        {percent > 0 ? 'Lanjutkan' : 'Mulai Belajar'}
                    </Button>
                ) : (
                    <Button fullWidth variant="secondary" disabled>
                        Selesaikan modul sebelumnya
                    </Button>
                )}
            </div>
        </div>
    );
}
