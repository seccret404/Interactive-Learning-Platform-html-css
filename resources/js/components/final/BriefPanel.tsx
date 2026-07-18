import {
    BuildingOffice2Icon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    SwatchIcon,
} from '@heroicons/react/24/outline';
import type { FinalProjectBrief, KontenEntry } from '@/types';

function Section({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="text-brand-600">{icon}</span>
                {title}
            </h3>
            <div className="mt-3 text-sm text-slate-600">{children}</div>
        </section>
    );
}

function KontenBlock({ entry }: { entry: KontenEntry }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {entry.label}
            </p>
            {entry.value && <p className="mt-0.5 text-slate-700">{entry.value}</p>}
            {entry.items && (
                <ul className="mt-1 list-inside list-disc text-slate-700">
                    {entry.items.map((it, i) => (
                        <li key={i}>{it}</li>
                    ))}
                </ul>
            )}
            {entry.table && (
                <div className="mt-1 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr>
                                {entry.table.headers.map((h, i) => (
                                    <th
                                        key={i}
                                        className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-600"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {entry.table.rows.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td
                                            key={j}
                                            className="border border-slate-200 px-2 py-1 text-slate-700"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/** The read-only project brief: narrative, client needs, content, and rules. */
export function BriefPanel({ brief }: { brief: FinalProjectBrief }) {
    return (
        <div className="flex flex-col gap-4">
            <Section
                icon={<BuildingOffice2Icon className="h-4 w-4" />}
                title="Narasi Proyek"
            >
                <p className="leading-relaxed">{brief.narasi}</p>
            </Section>

            <Section
                icon={<ClipboardDocumentListIcon className="h-4 w-4" />}
                title="Kebutuhan Klien"
            >
                <ul className="list-inside list-disc space-y-1">
                    {brief.client_needs.map((need, i) => (
                        <li key={i}>{need}</li>
                    ))}
                </ul>
            </Section>

            <Section
                icon={<DocumentTextIcon className="h-4 w-4" />}
                title="Konten yang Digunakan"
            >
                <div className="space-y-3">
                    {brief.konten.map((entry, i) => (
                        <KontenBlock key={i} entry={entry} />
                    ))}
                </div>
            </Section>

            <Section
                icon={<SwatchIcon className="h-4 w-4" />}
                title="Ketentuan HTML & CSS"
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            HTML
                        </p>
                        <ul className="mt-1 list-inside list-disc space-y-0.5">
                            {brief.html_requirements.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            CSS
                        </p>
                        <ul className="mt-1 list-inside list-disc space-y-0.5">
                            {brief.css_requirements.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {brief.petunjuk.map((p, i) => (
                        <li key={i}>• {p}</li>
                    ))}
                </ul>
            </Section>
        </div>
    );
}
