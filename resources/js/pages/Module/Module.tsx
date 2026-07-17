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

    return (
        <AppLayout>
            <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
            >
                <ArrowLeftIcon className="h-4 w-4" /> Kembali ke menu
            </Link>

            <header className="mt-5 flex items-start gap-4 animate-slide-up">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <ModuleIcon name={module.icon} className="h-7 w-7" />
                </span>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
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
                                        ? 'border-slate-100 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md'
                                        : 'cursor-not-allowed border-slate-100 opacity-70'
                                }`}
                            >
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                        completed
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : unlocked
                                              ? 'bg-brand-50 text-brand-600'
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
                                    <span className="block text-xs font-medium text-slate-400">
                                        Sub-modul {index + 1}
                                    </span>
                                    <span className="block text-base font-semibold text-slate-800">
                                        {sub.title}
                                    </span>
                                    <span className="block text-sm text-slate-500">
                                        {sub.description}
                                    </span>
                                </span>

                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                        completed
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : unlocked
                                              ? 'bg-brand-100 text-brand-700'
                                              : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {completed
                                        ? 'Completed'
                                        : unlocked
                                          ? 'Unlocked'
                                          : 'Locked'}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </AppLayout>
    );
}
