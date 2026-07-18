import { useQuery, useMutation } from '@tanstack/react-query';
import {
    fetchFinalProjects,
    fetchFinalProject,
    submitFinalProject,
} from '@/services/api';
import type {
    FinalProjectSummary,
    FinalProjectBrief,
    FinalProjectResult,
} from '@/types';

/** List of Final Project themes (for random assignment / theme switching). */
export function useFinalProjects() {
    return useQuery<FinalProjectSummary[]>({
        queryKey: ['final-projects'],
        queryFn: fetchFinalProjects,
        staleTime: 5 * 60 * 1000,
    });
}

/** Full brief for one theme. */
export function useFinalProject(id: string | null) {
    return useQuery<FinalProjectBrief>({
        queryKey: ['final-project', id],
        queryFn: () => fetchFinalProject(id as string),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    });
}

/** Submit the website (html + css) for grading. */
export function useSubmitFinalProject() {
    return useMutation<
        FinalProjectResult,
        Error,
        { id: string; html: string; css: string }
    >({
        mutationFn: ({ id, html, css }) => submitFinalProject(id, html, css),
    });
}
