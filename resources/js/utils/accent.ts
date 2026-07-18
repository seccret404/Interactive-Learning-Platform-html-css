/**
 * Semantic accent colours per learning material, following the UI guideline:
 *   HTML  → coral   CSS → blue   Project → purple
 *
 * The full class strings are written out literally so Tailwind's source scan
 * generates them (dynamic string concatenation would not be detected).
 */

export type Accent = 'html' | 'css' | 'project';

export interface AccentClasses {
    /** Accent text colour. */
    text: string;
    /** Soft tinted background (50). */
    bgSoft: string;
    /** Slightly stronger tint (100). */
    bgSoft2: string;
    /** Solid filled background (500). */
    solid: string;
    /** Hover for solid buttons. */
    solidHover: string;
    /** Soft border (200). */
    border: string;
    /** Hover border (200) — full literal so Tailwind emits it. */
    hoverBorder: string;
    /** Focus ring (400). */
    ring: string;
    /** Gradient start (from-…-50) for hero cards. */
    gradient: string;
    /** Status dot / top-bar (500). */
    dot: string;
}

export const ACCENTS: Record<Accent, AccentClasses> = {
    html: {
        text: 'text-html-600',
        bgSoft: 'bg-html-50',
        bgSoft2: 'bg-html-100',
        solid: 'bg-html-500',
        solidHover: 'hover:bg-html-600',
        border: 'border-html-200',
        hoverBorder: 'hover:border-html-200',
        ring: 'ring-html-400',
        gradient: 'from-html-50',
        dot: 'bg-html-500',
    },
    css: {
        text: 'text-css-600',
        bgSoft: 'bg-css-50',
        bgSoft2: 'bg-css-100',
        solid: 'bg-css-500',
        solidHover: 'hover:bg-css-600',
        border: 'border-css-200',
        hoverBorder: 'hover:border-css-200',
        ring: 'ring-css-400',
        gradient: 'from-css-50',
        dot: 'bg-css-500',
    },
    project: {
        text: 'text-project-600',
        bgSoft: 'bg-project-50',
        bgSoft2: 'bg-project-100',
        solid: 'bg-project-500',
        solidHover: 'hover:bg-project-600',
        border: 'border-project-200',
        hoverBorder: 'hover:border-project-200',
        ring: 'ring-project-400',
        gradient: 'from-project-50',
        dot: 'bg-project-500',
    },
};

/** Map a module id (or "project"/"final") to its accent. */
export function accentFor(id: string): Accent {
    if (id === 'css') return 'css';
    if (id === 'project' || id === 'final' || id === 'final-project') return 'project';
    return 'html';
}

/** Convenience: the resolved class set for an id. */
export function accentClasses(id: string): AccentClasses {
    return ACCENTS[accentFor(id)];
}
