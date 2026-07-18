import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeftIcon,
    LockClosedIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/solid';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/Button/Button';
import { CodeEditor } from '@/components/CodeEditor/CodeEditor';
import { LivePreview } from '@/components/final/LivePreview';
import { BriefPanel } from '@/components/final/BriefPanel';
import { ResultPanel } from '@/components/final/ResultPanel';
import { Loading, ErrorState } from '@/components/common/States';
import { useModules } from '@/hooks/useModules';
import {
    useFinalProjects,
    useFinalProject,
    useSubmitFinalProject,
} from '@/hooks/useFinalProject';
import { useProgress } from '@/context/ProgressContext';
import { isModuleCompleted } from '@/utils/progress';
import type { FinalProjectSummary } from '@/types';

type Tab = 'html' | 'css' | 'preview';

function pickRandom(list: FinalProjectSummary[], excludeId?: string): string {
    const pool =
        excludeId && list.length > 1
            ? list.filter((t) => t.id !== excludeId)
            : list;
    return pool[Math.floor(Math.random() * pool.length)].id;
}

export function FinalProject() {
    const { data: modules } = useModules();
    const { progress, setTheme } = useProgress();
    const { data: themes } = useFinalProjects();

    // Unlock rule: Final Project opens only after HTML and CSS are complete.
    const unlocked = useMemo(() => {
        if (!modules) return false;
        return modules.every((m) => isModuleCompleted(m, progress));
    }, [modules, progress]);

    // A theme is assigned at session start; fall back just in case it is unset.
    useEffect(() => {
        if (!unlocked || !themes || themes.length === 0) return;
        if (!progress.theme) setTheme(pickRandom(themes));
    }, [unlocked, themes, progress.theme, setTheme]);

    const themeId = progress.theme;
    const { data: brief, isLoading, isError, refetch } = useFinalProject(
        unlocked ? themeId : null,
    );
    const submit = useSubmitFinalProject();

    const [tab, setTab] = useState<Tab>('html');
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');

    // Seed the editors from the brief's starter code when the theme changes.
    useEffect(() => {
        if (brief) {
            setHtml(brief.starter_html);
            setCss(brief.starter_css);
            submit.reset();
            setTab('html');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brief?.id]);

    const changeTheme = () => {
        if (themes) setTheme(pickRandom(themes, themeId ?? undefined));
    };

    if (!modules || (unlocked && (isLoading || !themeId))) {
        return (
            <AppLayout showHeader={false}>
                <Loading label="Menyiapkan Final Project..." />
            </AppLayout>
        );
    }

    if (!unlocked) {
        return (
            <AppLayout>
                <div className="mx-auto max-w-md rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <LockClosedIcon className="h-7 w-7" />
                    </span>
                    <h1 className="mt-4 text-xl font-bold text-slate-900">
                        Final Project Terkunci
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Selesaikan seluruh modul HTML dan CSS terlebih dahulu untuk
                        membuka proyek mandiri ini.
                    </p>
                    <Link to="/" className="mt-6 inline-block">
                        <Button variant="primary">Kembali ke Beranda</Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    if (isError || !brief) {
        return (
            <AppLayout>
                <ErrorState title="Brief tidak ditemukan" onRetry={() => refetch()} />
            </AppLayout>
        );
    }

    const runSubmit = () =>
        submit.mutate({ id: brief.id, html, css });

    return (
        <AppLayout showHeader={false}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                <div>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Beranda
                    </Link>
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-project-600">
                        &lt;project&gt; Final Project · Proyek Mandiri
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-ink">
                        {brief.title}
                    </h1>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={changeTheme}
                    leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                >
                    Ganti Tema
                </Button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
                {/* Brief */}
                <div className="order-2 lg:order-1">
                    <BriefPanel brief={brief} />
                </div>

                {/* Workspace */}
                <div className="order-1 flex flex-col gap-4 lg:order-2">
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                        {(
                            [
                                ['html', 'index.html'],
                                ['css', 'style.css'],
                                ['preview', 'Preview'],
                            ] as [Tab, string][]
                        ).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                    tab === key
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="h-[460px]">
                        {tab === 'html' && (
                            <CodeEditor value={html} onChange={setHtml} language="html" />
                        )}
                        {tab === 'css' && (
                            <CodeEditor value={css} onChange={setCss} language="css" />
                        )}
                        {tab === 'preview' && <LivePreview html={html} css={css} />}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">
                            Kerjakan mandiri, lalu kumpulkan untuk dinilai.
                        </span>
                        <Button
                            variant="success"
                            onClick={runSubmit}
                            isLoading={submit.isPending}
                            leftIcon={<PaperAirplaneIcon className="h-4 w-4" />}
                        >
                            Kumpulkan Proyek
                        </Button>
                    </div>

                    {submit.isError && (
                        <p className="text-sm text-rose-600">
                            Gagal mengirim proyek. Coba lagi.
                        </p>
                    )}
                </div>
            </div>

            {submit.data && (
                <div className="mt-6">
                    <ResultPanel result={submit.data} />
                </div>
            )}
        </AppLayout>
    );
}
