import { useNavigate } from 'react-router-dom';
import {
    LockClosedIcon,
    TrophyIcon,
    FireIcon,
    CheckBadgeIcon,
    BookOpenIcon,
    PencilSquareIcon,
    AcademicCapIcon,
    ChartBarIcon,
} from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/Button/Button';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Loading, ErrorState, EmptyState } from '@/components/common/States';
import { useModules } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';
import {
    isModuleUnlocked,
    isModuleCompleted,
    isSubModuleCompleted,
    isSubModuleUnlocked,
    moduleProgressPercent,
    nextSubModuleId,
} from '@/utils/progress';
import { accentClasses, accentFor } from '@/utils/accent';
import type { ModuleSummary, SessionProgress } from '@/types';

const cleanTitle = (t: string) => t.replace(/^Modul \d+\s*—\s*/, '');

export function Home() {
    const { data: modules, isLoading, isError, refetch } = useModules();
    const { progress, reset } = useProgress();
    const navigate = useNavigate();

    return (
        <AppLayout>
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
                <Dashboard
                    modules={modules}
                    progress={progress}
                    onReset={reset}
                    navigate={navigate}
                />
            )}
        </AppLayout>
    );
}

function Dashboard({
    modules,
    progress,
    onReset,
    navigate,
}: {
    modules: ModuleSummary[];
    progress: SessionProgress;
    onReset: () => void;
    navigate: (to: string) => void;
}) {
    const totalSub = modules.reduce((s, m) => s + m.subModules.length, 0);
    const completedSub = progress.completedQuiz.length;
    const modulesDone = progress.completedModules.length;
    const totalPct = totalSub ? Math.round((completedSub / totalSub) * 100) : 0;
    const allDone = modules.every((m) => isModuleCompleted(m, progress));

    // The module to continue: first unlocked-but-unfinished, else the first.
    const activeModule =
        modules.find(
            (m) => isModuleUnlocked(modules, progress, m.id) && !isModuleCompleted(m, progress),
        ) ?? modules[0];
    const activeAccent = accentClasses(activeModule.id);
    const activePct = moduleProgressPercent(activeModule, progress);
    const nextSub = nextSubModuleId(modules, progress, activeModule.id);
    const firstName = progress.profile?.name?.trim().split(/\s+/)[0] || 'Sobat';

    return (
        <div className="space-y-8">
            {/* Greeting */}
            <div className="flex flex-wrap items-center justify-between gap-3 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                        Halo, {firstName}! <span className="inline-block">👋</span>
                    </h1>
                    <p className="mt-1 text-slate-500">
                        Lanjut dari titik terakhir kamu belajar.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-html-200 bg-html-50 px-3 py-1.5 text-sm font-semibold text-html-600">
                    <FireIcon className="h-4 w-4" />
                    {completedSub > 0
                        ? `${completedSub} kuis selesai`
                        : 'Mulai belajar yuk!'}
                </span>
            </div>

            {/* Continue card */}
            <div className="overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-sm animate-slide-up sm:p-8">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <span
                            className={`text-xs font-semibold uppercase tracking-wide ${activeAccent.text}`}
                        >
                            &lt;{accentFor(activeModule.id)}&gt; Modul {activeModule.title}
                        </span>
                        <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                            {allDone
                                ? 'Semua modul selesai! 🎉'
                                : cleanTitle(
                                      activeModule.subModules.find((s) => s.id === nextSub)
                                          ?.title ?? activeModule.title,
                                  )}
                        </h2>
                        <p className="mt-1 text-sm text-slate-300">
                            {completedSub} dari {totalSub} kuis selesai di seluruh materi.
                        </p>
                        <div className="mt-5">
                            {allDone ? (
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/final-project')}
                                    rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                                >
                                    Kerjakan Final Project
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        navigate(
                                            `/module/${activeModule.id}/theory/${nextSub}`,
                                        )
                                    }
                                    rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                                >
                                    Lanjutkan Belajar
                                </Button>
                            )}
                        </div>
                    </div>
                    <ProgressRing
                        value={allDone ? 100 : activePct}
                        size={104}
                        colorClass={activeAccent.text}
                        trackClass="text-white/15"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    icon={<BookOpenIcon className="h-5 w-5" />}
                    value={`${modulesDone}/${modules.length}`}
                    label="Materi Selesai"
                />
                <StatCard
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                    value={`${progress.attempts.length}`}
                    label="Latihan Dikerjakan"
                />
                <StatCard
                    icon={<AcademicCapIcon className="h-5 w-5" />}
                    value={`${completedSub}/${totalSub}`}
                    label="Kuis Lulus"
                />
                <StatCard
                    icon={<ChartBarIcon className="h-5 w-5" />}
                    value={`${totalPct}%`}
                    label="Total Progres"
                />
            </div>

            {/* Modules by material */}
            {modules.map((module) => (
                <MaterialSection
                    key={module.id}
                    module={module}
                    modules={modules}
                    progress={progress}
                    onOpen={(subId) =>
                        navigate(`/module/${module.id}/theory/${subId}`)
                    }
                />
            ))}

            {/* Final project */}
            <FinalProjectCard unlocked={allDone} onOpen={() => navigate('/final-project')} />

            {progress.completedQuiz.length > 0 && (
                <div className="flex justify-center pt-2">
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        Reset progress
                    </Button>
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-slide-up">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                {icon}
            </span>
            <p className="mt-3 text-2xl font-bold text-ink">{value}</p>
            <p className="text-xs font-medium text-slate-400">{label}</p>
        </div>
    );
}

function MaterialSection({
    module,
    modules,
    progress,
    onOpen,
}: {
    module: ModuleSummary;
    modules: ModuleSummary[];
    progress: SessionProgress;
    onOpen: (subId: number) => void;
}) {
    const accent = accentClasses(module.id);
    const accentName = accentFor(module.id);

    return (
        <section className="animate-slide-up">
            <p className={`mb-3 text-sm font-bold ${accent.text}`}>
                &lt;{accentName}&gt; Modul {module.title}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {module.subModules.map((sub, i) => {
                    const completed = isSubModuleCompleted(progress, module.id, sub.id);
                    const unlocked = isSubModuleUnlocked(
                        modules,
                        progress,
                        module.id,
                        sub.id,
                    );
                    return (
                        <SubModuleCard
                            key={sub.id}
                            eyebrow={`${module.title} ${String(i + 1).padStart(2, '0')}`}
                            title={cleanTitle(sub.title)}
                            description={sub.description}
                            completed={completed}
                            unlocked={unlocked}
                            accentName={accentName}
                            onOpen={() => onOpen(sub.id)}
                        />
                    );
                })}
            </div>
        </section>
    );
}

function SubModuleCard({
    eyebrow,
    title,
    description,
    completed,
    unlocked,
    accentName,
    onOpen,
}: {
    eyebrow: string;
    title: string;
    description: string;
    completed: boolean;
    unlocked: boolean;
    accentName: 'html' | 'css' | 'project';
    onOpen: () => void;
}) {
    const accent = accentClasses(accentName);
    const clickable = unlocked;

    return (
        <div
            className={`group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                clickable
                    ? 'cursor-pointer border-slate-100 hover:-translate-y-0.5 hover:shadow-md'
                    : 'border-slate-100 opacity-70'
            }`}
            onClick={clickable ? onOpen : undefined}
        >
            {/* Accent top rule */}
            <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${accent.text}`}>
                    {eyebrow}
                </span>
                {completed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700">
                        <CheckBadgeIcon className="h-3.5 w-3.5" /> Selesai
                    </span>
                ) : unlocked ? (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full ${accent.bgSoft} px-2 py-0.5 text-[11px] font-semibold ${accent.text}`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} /> Sedang
                        Berjalan
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                        <LockClosedIcon className="h-3 w-3" /> Terkunci
                    </span>
                )}
            </div>

            <h3 className="mt-3 font-bold text-ink">{title}</h3>
            <p className="mt-1 flex-1 text-sm text-slate-500">{description}</p>

            <div className={`mt-4 text-sm font-semibold ${clickable ? accent.text : 'text-slate-300'}`}>
                {completed
                    ? 'Lihat Ulang →'
                    : unlocked
                      ? 'Mulai →'
                      : 'Terkunci'}
            </div>
        </div>
    );
}

function FinalProjectCard({
    unlocked,
    onOpen,
}: {
    unlocked: boolean;
    onOpen: () => void;
}) {
    return (
        <section
            className={`overflow-hidden rounded-3xl border p-6 shadow-sm transition-all animate-slide-up ${
                unlocked
                    ? 'border-project-200 bg-gradient-to-br from-project-50 to-white'
                    : 'border-slate-100 bg-white opacity-90'
            }`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            unlocked ? 'bg-project-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        {unlocked ? (
                            <TrophyIcon className="h-6 w-6" />
                        ) : (
                            <LockClosedIcon className="h-5 w-5" />
                        )}
                    </span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-project-600">
                            &lt;project&gt; Proyek Mini
                        </p>
                        <h2 className="mt-0.5 text-xl font-bold text-ink">Final Project</h2>
                        <p className="mt-1 max-w-xl text-sm text-slate-500">
                            {unlocked
                                ? 'Bangun sebuah website lengkap dari brief klien yang dipilih acak, lalu dinilai otomatis.'
                                : 'Terbuka setelah seluruh modul HTML dan CSS selesai. Uji semua yang telah kamu pelajari dalam satu proyek nyata.'}
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    {unlocked ? (
                        <Button onClick={onOpen} rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                            Mulai Proyek
                        </Button>
                    ) : (
                        <Button variant="secondary" disabled>
                            Terkunci
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
