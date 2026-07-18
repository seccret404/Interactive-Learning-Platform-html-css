import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchModules, fetchModule, checkAnswer } from '@/services/api';
import { useProgress } from '@/context/ProgressContext';
import type { ModuleSummary, ModuleDetail, QuizResult, QuizAnswer } from '@/types';

/** List of modules for the main menu. */
export function useModules() {
    return useQuery<ModuleSummary[]>({
        queryKey: ['modules'],
        queryFn: fetchModules,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Full detail for a single module (slides + public quiz fields). Editor quiz
 * questions are resolved to the learner's assigned theme variant.
 */
export function useModule(id: string | undefined) {
    const { progress } = useProgress();
    const theme = progress.theme;
    return useQuery<ModuleDetail>({
        queryKey: ['module', id, theme],
        queryFn: () => fetchModule(id as string, theme),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    });
}

/** Mutation that submits a single question answer to the validation API. */
export function useCheckAnswer() {
    return useMutation<QuizResult, Error, QuizAnswer>({
        mutationFn: (payload) => checkAnswer(payload),
    });
}
