import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    LockClosedIcon,
    CheckCircleIcon,
    PlayCircleIcon,
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { AppLayout } from '@/layouts/AppLayout';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { Loading, ErrorState } from '@/components/common/States';
import { ModuleIcon } from '@/components/common/ModuleIcon';
import { useModule, useModules } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';
import {
    isModuleUnlocked,
    isSubModuleUnlocked,
    isSubModuleCompleted,
    moduleProgressPercent,
} from '@/utils/progress';
import { accentClasses, accentFor } from '@/utils/accent';

const cleanTitle = (t: string) => t.replace(/^Modul \d+\s*—\s*/, '');

export function Module() {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const { progress } = useProgress();

    const { data: modules } = useModules();
    const { data: module, isLoading, isError, refetch } = useModule(moduleId);

    if (isLoading) {
        return (
            <AppLayout>
                <Loading label="Memuat modul..." />
            </AppLayout>
        );
    }

    if (isError || !module || !moduleId) {
        return (
            <AppLayout>
                <ErrorState
                    title="Modul tidak ditemukan"
                    onRetry={() => refetch()}
                />
            </AppLayout>
        );
    }

    // Guard: if the whole module is locked, bounce back to the menu.
    const moduleUnlocked = modules
        ? isModuleUnlocked(modules, progress, moduleId)
        : true;

    if (modules && !moduleUnlocked) {
        return (
            <AppLayout>
                <ErrorState
                    title="Modul terkunci"
                    description="Selesaikan modul sebelumnya untuk membuka modul ini."
                    onRetry={() => navigate('/')}
                />
            </AppLayout>
        );
    }

    const percent = moduleProgressPercent(module, progress);
    const moduleList = modules ?? [module];
    const accent = accentClasses(moduleId);
    const accentName = accentFor(moduleId);

    return (
        <AppLayout>
            <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
            >
                <ArrowLeftIcon className="h-4 w-4" /> Kembali ke beranda
            </Link>

            <header className="mt-5 flex items-start gap-4 animate-slide-up">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bgSoft} ${accent.text}`}>
                    <ModuleIcon name={module.icon} className="h-7 w-7" />
                </span>
                <div className="flex-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${accent.text}`}>
                        &lt;{accentName}&gt; Materi
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-ink">
                        {module.title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">{module.description}</p>
                    <ProgressBar value={percent} className="mt-3 max-w-xs" />
                </div>
            </header>

            <ol className="mt-8 space-y-3">
                {module.subModules.map((sub, index) => {
                    const completed = isSubModuleCompleted(progress, moduleId, sub.id);
                    const unlocked = isSubModuleUnlocked(
                        moduleList,
                        progress,
                        moduleId,
                        sub.id,
                    );

                    return (
                        <li
                            key={sub.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <button
                                type="button"
                                disabled={!unlocked}
                                onClick={() =>
                                    navigate(`/module/${moduleId}/theory/${sub.id}`)
                                }
                                className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-200 ${
                                    unlocked
                                        ? `border-slate-100 hover:-translate-y-0.5 ${accent.hoverBorder} hover:shadow-md`
                                        : 'cursor-not-allowed border-slate-100 opacity-70'
                                }`}
                            >
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                        completed
                                            ? 'bg-success-50 text-success-600'
                                            : unlocked
                                              ? `${accent.bgSoft} ${accent.text}`
                                              : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {completed ? (
                                        <CheckCircleIcon className="h-6 w-6" />
                                    ) : unlocked ? (
                                        <PlayCircleIcon className="h-6 w-6" />
                                    ) : (
                                        <LockClosedIcon className="h-4 w-4" />
                                    )}
                                </span>

                                <span className="flex-1">
                                    <span className={`block text-xs font-bold uppercase tracking-wider ${accent.text}`}>
                                        {module.title} {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="block text-base font-semibold text-ink">
                                        {cleanTitle(sub.title)}
                                    </span>
                                    <span className="block text-sm text-slate-500">
                                        {sub.description}
                                    </span>
                                </span>

                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                        completed
                                            ? 'bg-success-100 text-success-700'
                                            : unlocked
                                              ? `${accent.bgSoft2} ${accent.text}`
                                              : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {completed
                                        ? 'Selesai'
                                        : unlocked
                                          ? 'Terbuka'
                                          : 'Terkunci'}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </AppLayout>
    );
}
