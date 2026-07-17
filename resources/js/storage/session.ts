import type { SessionProgress } from '@/types';

/**
 * sessionStorage-backed persistence for user progress.
 *
 * Per the project rules: NO database, NO localStorage. Progress lives only in
 * sessionStorage and is intentionally lost when the browser/tab is closed.
 */

const STORAGE_KEY = 'ilp:progress';

export const emptyProgress = (): SessionProgress => ({
    currentModule: null,
    currentSubModule: null,
    completedQuiz: [],
    completedModules: [],
    attempts: [],
});

/** Build the composite key used to track a completed quiz / sub-module. */
export const quizKey = (moduleId: string, subModuleId: number): string =>
    `${moduleId}:${subModuleId}`;

export function loadProgress(): SessionProgress {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyProgress();

        const parsed = JSON.parse(raw) as Partial<SessionProgress>;
        return { ...emptyProgress(), ...parsed };
    } catch {
        // Corrupt or unavailable storage — start fresh rather than crash.
        return emptyProgress();
    }
}

export function saveProgress(progress: SessionProgress): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
        // Storage may be full or disabled; progress simply won't persist.
    }
}

export function clearProgress(): void {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        /* no-op */
    }
}
