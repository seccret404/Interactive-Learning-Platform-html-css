import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { Attempt, ModuleSummary, SessionProgress } from '@/types';
import {
    loadProgress,
    saveProgress,
    quizKey,
    emptyProgress,
} from '@/storage/session';
import { recomputeCompletedModules } from '@/utils/progress';
import { formatTime, uid } from '@/utils/time';

interface ProgressContextValue {
    progress: SessionProgress;
    /** Mark a sub-module quiz as completed and recompute module completion. */
    completeSubModule: (
        moduleId: string,
        subModuleId: number,
        modules: ModuleSummary[],
    ) => void;
    /** Record a Run attempt (correct or wrong) into history. */
    recordAttempt: (
        moduleId: string,
        subModuleId: number,
        correct: boolean,
        code: string,
    ) => void;
    /** Attempts for a specific quiz, newest last. */
    attemptsFor: (moduleId: string, subModuleId: number) => Attempt[];
    /** Remember where the user currently is. */
    setCurrent: (moduleId: string, subModuleId: number) => void;
    /** Wipe all progress (used by "Reset progress"). */
    reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<SessionProgress>(() =>
        loadProgress(),
    );

    // Persist to sessionStorage on every change.
    useEffect(() => {
        saveProgress(progress);
    }, [progress]);

    const completeSubModule = useCallback(
        (moduleId: string, subModuleId: number, modules: ModuleSummary[]) => {
            setProgress((prev) => {
                const key = quizKey(moduleId, subModuleId);
                const completedQuiz = prev.completedQuiz.includes(key)
                    ? prev.completedQuiz
                    : [...prev.completedQuiz, key];

                const next: SessionProgress = { ...prev, completedQuiz };
                next.completedModules = recomputeCompletedModules(modules, next);
                return next;
            });
        },
        [],
    );

    const recordAttempt = useCallback(
        (moduleId: string, subModuleId: number, correct: boolean, code: string) => {
            const now = Date.now();
            const attempt: Attempt = {
                id: uid(),
                moduleId,
                subModuleId,
                time: formatTime(now),
                timestamp: now,
                correct,
                code,
            };
            setProgress((prev) => ({
                ...prev,
                attempts: [...prev.attempts, attempt],
            }));
        },
        [],
    );

    const attemptsFor = useCallback(
        (moduleId: string, subModuleId: number) =>
            progress.attempts.filter(
                (a) => a.moduleId === moduleId && a.subModuleId === subModuleId,
            ),
        [progress.attempts],
    );

    const setCurrent = useCallback((moduleId: string, subModuleId: number) => {
        setProgress((prev) => ({
            ...prev,
            currentModule: moduleId,
            currentSubModule: subModuleId,
        }));
    }, []);

    const reset = useCallback(() => setProgress(emptyProgress()), []);

    const value = useMemo<ProgressContextValue>(
        () => ({
            progress,
            completeSubModule,
            recordAttempt,
            attemptsFor,
            setCurrent,
            reset,
        }),
        [progress, completeSubModule, recordAttempt, attemptsFor, setCurrent, reset],
    );

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): ProgressContextValue {
    const ctx = useContext(ProgressContext);
    if (!ctx) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return ctx;
}
