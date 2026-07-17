import type { ModuleSummary, SessionProgress } from '@/types';
import { quizKey } from '@/storage/session';

/**
 * Pure helpers that derive unlock/completion state from the module list and
 * the user's saved progress. Keeping these pure makes the unlock rules easy to
 * reason about and test, independent of React.
 *
 * Rules:
 *  - A sub-module is completed once its quiz is answered correctly.
 *  - The first sub-module of an unlocked module is open; each subsequent
 *    sub-module unlocks only after the previous one is completed.
 *  - A module is unlocked only when every module listed in its `requires`
 *    array is fully completed (e.g. CSS requires HTML).
 */

export function isSubModuleCompleted(
    progress: SessionProgress,
    moduleId: string,
    subModuleId: number,
): boolean {
    return progress.completedQuiz.includes(quizKey(moduleId, subModuleId));
}

export function isModuleCompleted(
    module: Pick<ModuleSummary, 'id' | 'subModules'>,
    progress: SessionProgress,
): boolean {
    if (module.subModules.length === 0) return false;
    return module.subModules.every((sub) =>
        isSubModuleCompleted(progress, module.id, sub.id),
    );
}

export function isModuleUnlocked(
    modules: ModuleSummary[],
    progress: SessionProgress,
    moduleId: string,
): boolean {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return false;

    return module.requires.every((requiredId) => {
        const required = modules.find((m) => m.id === requiredId);
        return required ? isModuleCompleted(required, progress) : true;
    });
}

export function isSubModuleUnlocked(
    modules: ModuleSummary[],
    progress: SessionProgress,
    moduleId: string,
    subModuleId: number,
): boolean {
    if (!isModuleUnlocked(modules, progress, moduleId)) return false;

    const module = modules.find((m) => m.id === moduleId);
    if (!module) return false;

    const index = module.subModules.findIndex((s) => s.id === subModuleId);
    if (index <= 0) return index === 0; // first sub-module is always open

    const previous = module.subModules[index - 1];
    return isSubModuleCompleted(progress, moduleId, previous.id);
}

export function moduleProgressPercent(
    module: Pick<ModuleSummary, 'id' | 'subModules'>,
    progress: SessionProgress,
): number {
    if (module.subModules.length === 0) return 0;
    const done = module.subModules.filter((sub) =>
        isSubModuleCompleted(progress, module.id, sub.id),
    ).length;
    return Math.round((done / module.subModules.length) * 100);
}

/**
 * The sub-module a "Continue" button should jump to: the first not-yet
 * completed and unlocked sub-module, or the first one as a fallback.
 */
export function nextSubModuleId(
    modules: ModuleSummary[],
    progress: SessionProgress,
    moduleId: string,
): number | null {
    const module = modules.find((m) => m.id === moduleId);
    if (!module || module.subModules.length === 0) return null;

    const next = module.subModules.find(
        (sub) =>
            !isSubModuleCompleted(progress, moduleId, sub.id) &&
            isSubModuleUnlocked(modules, progress, moduleId, sub.id),
    );

    return (next ?? module.subModules[0]).id;
}

/** Recompute which modules are fully completed after a change. */
export function recomputeCompletedModules(
    modules: ModuleSummary[],
    progress: SessionProgress,
): string[] {
    return modules
        .filter((module) => isModuleCompleted(module, progress))
        .map((module) => module.id);
}
