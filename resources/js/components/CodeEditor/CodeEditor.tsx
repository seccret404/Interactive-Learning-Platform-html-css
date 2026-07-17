import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: 'html' | 'css';
    readOnly?: boolean;
}

/** Monaco-based code editor wrapper with sensible defaults. */
export function CodeEditor({
    value,
    onChange,
    language = 'html',
    readOnly = false,
}: CodeEditorProps) {
    return (
        <div className="h-full overflow-hidden rounded-2xl border border-slate-800">
            <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={value}
                onChange={(val) => onChange(val ?? '')}
                loading={
                    <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
                        Memuat editor...
                    </div>
                }
                options={{
                    readOnly,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    padding: { top: 14, bottom: 14 },
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                }}
            />
        </div>
    );
}
