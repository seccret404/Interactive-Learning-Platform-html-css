import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface StudyCaseProps {
    studyCase: string;
}

export function StudyCase({ studyCase }: StudyCaseProps) {
    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-600">
                <ClipboardDocumentListIcon className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                    Study Case
                </h3>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {studyCase}
            </p>
        </section>
    );
}
