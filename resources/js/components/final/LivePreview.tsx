import { useMemo } from 'react';

interface LivePreviewProps {
    html: string;
    css: string;
}

/**
 * Renders the student's website in a sandboxed iframe. The external stylesheet
 * (style.css) can't load inside the sandbox, so the CSS is injected as an inline
 * <style> block — matching what the browser would show if the files were served
 * together. Scripts are disabled via the empty sandbox attribute.
 */
export function LivePreview({ html, css }: LivePreviewProps) {
    const srcDoc = useMemo(() => {
        const style = `<style>\n${css}\n</style>`;
        if (/<\/head>/i.test(html)) {
            return html.replace(/<\/head>/i, `${style}\n</head>`);
        }
        return `${style}\n${html}`;
    }, [html, css]);

    return (
        <iframe
            title="Preview Website"
            srcDoc={srcDoc}
            sandbox=""
            className="h-full w-full rounded-2xl border border-slate-200 bg-white"
        />
    );
}
