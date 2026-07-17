import type { Slide as SlideType } from '@/types';

interface SlideProps {
    slide: SlideType;
    /** Used as React key by parent to retrigger the entrance animation. */
}

/** Renders a single theory slide: title, body text, optional image. */
export function Slide({ slide }: SlideProps) {
    return (
        <article className="animate-slide-in">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {slide.title}
            </h2>
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-slate-600 sm:text-lg">
                {slide.content}
            </p>
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
