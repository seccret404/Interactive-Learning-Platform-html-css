import { NavLink, Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    RectangleStackIcon,
    TrophyIcon,
    CheckCircleIcon,
    LockClosedIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import { Logo } from '@/components/common/Logo';
import { useModules } from '@/hooks/useModules';
import { useProgress } from '@/context/ProgressContext';
import {
    isSubModuleCompleted,
    isSubModuleUnlocked,
    isModuleCompleted,
} from '@/utils/progress';
import { accentClasses, accentFor } from '@/utils/accent';
import type { ModuleSummary } from '@/types';

function NavItem({
    to,
    icon,
    label,
    end,
}: {
    to: string;
    icon: React.ReactNode;
    label: string;
    end?: boolean;
}) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`
            }
        >
            {icon}
            {label}
        </NavLink>
    );
}

function ModuleTree({ module }: { module: ModuleSummary }) {
    const { progress } = useProgress();
    const { data: modules } = useModules();
    const accent = accentClasses(module.id);
    const accentName = accentFor(module.id);

    return (
        <div>
            <p className={`px-3 text-[11px] font-bold uppercase tracking-wider ${accent.text}`}>
                &lt;{accentName}&gt; Modul {module.title}
            </p>
            <ul className="mt-1 space-y-0.5">
                {module.subModules.map((sub, i) => {
                    const done = isSubModuleCompleted(progress, module.id, sub.id);
                    const unlocked =
                        modules &&
                        isSubModuleUnlocked(modules, progress, module.id, sub.id);
                    const num = String(i + 1).padStart(2, '0');

                    const content = (
                        <>
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                {done ? (
                                    <CheckSolid className={`h-4 w-4 ${accent.text}`} />
                                ) : unlocked ? (
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                                    />
                                ) : (
                                    <LockClosedIcon className="h-3 w-3 text-slate-300" />
                                )}
                            </span>
                            <span className="truncate">
                                <span className="text-slate-400">{num}</span>{' '}
                                {sub.title.replace(/^Modul \d+ — /, '')}
                            </span>
                        </>
                    );

                    const base =
                        'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors';

                    return (
                        <li key={sub.id}>
                            {unlocked ? (
                                <Link
                                    to={`/module/${module.id}/theory/${sub.id}`}
                                    className={`${base} text-slate-600 hover:bg-slate-100`}
                                >
                                    {content}
                                </Link>
                            ) : (
                                <span
                                    className={`${base} cursor-not-allowed text-slate-300`}
                                >
                                    {content}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/** Persistent dashboard navigation: brand, links, module tree, and profile. */
export function Sidebar({ onEditProfile }: { onEditProfile?: () => void }) {
    const { data: modules } = useModules();
    const { progress } = useProgress();
    const location = useLocation();

    const profileName = progress.profile?.name?.trim() || 'Sobat B-Code';
    const profileKelas = progress.profile?.kelas?.trim() || 'Siswa';
    const initial = profileName[0]?.toUpperCase() ?? 'B';

    const allDone =
        modules && modules.length > 0 && modules.every((m) => isModuleCompleted(m, progress));
    const projectActive = location.pathname.startsWith('/final-project');

    return (
        <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
            <Link to="/" className="px-2 pt-1">
                <Logo />
            </Link>

            <nav className="space-y-1">
                <NavItem to="/" end icon={<HomeIcon className="h-5 w-5" />} label="Beranda" />
                <NavItem
                    to="/final-project"
                    icon={<TrophyIcon className="h-5 w-5" />}
                    label="Final Project"
                />
            </nav>

            <div className="space-y-4">
                <p className="flex items-center gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <RectangleStackIcon className="h-4 w-4" /> Materi
                </p>
                {modules?.map((m) => <ModuleTree key={m.id} module={m} />)}
            </div>

            {/* Final Project shortcut card */}
            <Link
                to="/final-project"
                className={`mx-1 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    projectActive
                        ? 'border-project-200 bg-project-50'
                        : 'border-slate-100 hover:border-project-200 hover:bg-project-50'
                }`}
            >
                <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        allDone
                            ? 'bg-project-500 text-white'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                >
                    {allDone ? (
                        <TrophyIcon className="h-4 w-4" />
                    ) : (
                        <LockClosedIcon className="h-4 w-4" />
                    )}
                </span>
                <div className="min-w-0">
                    <p className="font-semibold text-slate-800">Proyek Mini</p>
                    <p className="truncate text-xs text-slate-400">
                        {allDone ? 'Siap dikerjakan' : 'Selesaikan semua modul'}
                    </p>
                </div>
            </Link>

            <button
                type="button"
                onClick={onEditProfile}
                className="group mt-auto flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
            >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-html-500 to-brand-500 text-sm font-bold text-white">
                    {initial}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                        {profileName}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                        <CheckCircleIcon className="h-3.5 w-3.5" /> {profileKelas}
                    </p>
                </div>
                <PencilSquareIcon className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
            </button>
        </div>
    );
}
