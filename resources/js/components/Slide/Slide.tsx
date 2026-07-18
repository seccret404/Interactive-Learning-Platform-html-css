import type { Slide as SlideType } from '@/types';

/** Heuristic: does a block of text look like HTML/CSS code rather than prose? */
function looksLikeCode(block: string): boolean {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) return false;
    const codey = lines.filter((l) => {
        const t = l.trim();
        return (
            t.startsWith('<') ||
            t.startsWith('/*') ||
            /[{};]\s*$/.test(t) ||
            /^[.#]?[a-z0-9-]+\s*\{/.test(t) ||
            /^[a-z-]+:\s*[^;]+;/.test(t)
        );
    });
    return codey.length / lines.length >= 0.5;
}

/** Split content into prose / code blocks on blank lines. */
function blocks(content: string): { code: boolean; text: string }[] {
    return content
        .split(/\n{2,}/)
        .map((b) => b.replace(/\s+$/, ''))
        .filter((b) => b.trim() !== '')
        .map((b) => ({ code: looksLikeCode(b), text: b }));
}

interface SlideProps {
    slide: SlideType;
    /** Accent text class (e.g. text-html-600) for the eyebrow. */
    accentText?: string;
}

/** Renders one theory slide: eyebrow, title, prose + code blocks, image. */
export function Slide({ slide, accentText = 'text-brand-600' }: SlideProps) {
    return (
        <article className="animate-slide-in">
            <span className={`text-xs font-bold uppercase tracking-wider ${accentText}`}>
                Materi
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {slide.title}
            </h2>

            <div className="mt-5 space-y-4">
                {blocks(slide.content).map((b, i) =>
                    b.code ? (
                        <pre
                            key={i}
                            className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100"
                        >
                            <code>{b.text}</code>
                        </pre>
                    ) : (
                        <p
                            key={i}
                            className="whitespace-pre-line text-base leading-relaxed text-slate-600 sm:text-lg"
                        >
                            {b.text}
                        </p>
                    ),
                )}
            </div>

            {slide.image && (
                <img
                    src={slide.image}
                    alt={slide.title}
                    className="mt-6 w-full rounded-2xl border border-slate-100 shadow-sm"
                    loading="lazy"
                />
            )}
        </article>
    );
}
