import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchModules, fetchModule, checkAnswer } from '@/services/api';
import type { ModuleSummary, ModuleDetail, QuizResult, QuizAnswer } from '@/types';

/** List of modules for the main menu. */
export function useModules() {
    return useQuery<ModuleSummary[]>({
        queryKey: ['modules'],
        queryFn: fetchModules,
        staleTime: 5 * 60 * 1000,
    });
}

/** Full detail for a single module (slides + public quiz fields). */
export function useModule(id: string | undefined) {
    return useQuery<ModuleDetail>({
        queryKey: ['module', id],
        queryFn: () => fetchModule(id as string),
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
