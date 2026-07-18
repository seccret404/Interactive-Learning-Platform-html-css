import type { SessionProgress } from '@/types';

/**
 * localStorage-backed persistence for user progress and profile.
 *
 * Data is database-less and lives entirely in the browser. It persists across
 * tabs and browser restarts (until the user resets progress or clears storage).
 */

const STORAGE_KEY = 'ilp:progress';

/** The five case-study themes (matches storage/final-projects and quiz variants). */
export const THEMES = ['a', 'b', 'c', 'd', 'e'] as const;

/** Pick a random case-study theme id. */
export const randomTheme = (): string =>
    THEMES[Math.floor(Math.random() * THEMES.length)];

export const emptyProgress = (): SessionProgress => ({
    currentModule: null,
    currentSubModule: null,
    completedQuiz: [],
    completedModules: [],
    attempts: [],
    theme: null,
    profile: null,
});

/** Build the composite key used to track a completed quiz / sub-module. */
export const quizKey = (moduleId: string, subModuleId: number): string =>
    `${moduleId}:${subModuleId}`;

export function loadProgress(): SessionProgress {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
        // Storage may be full or disabled; progress simply won't persist.
    }
}

export function clearProgress(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* no-op */
    }
}
