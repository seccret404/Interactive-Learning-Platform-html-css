import type {
    ModuleSummary,
    ModuleDetail,
    QuizResult,
    QuizAnswer,
    FinalProjectSummary,
    FinalProjectBrief,
    FinalProjectResult,
} from '@/types';

/**
 * Thin REST client for the Laravel API. All endpoints are under /api.
 */

const BASE_URL = '/api';

interface ApiEnvelope<T> {
    success: boolean;
    data?: T;
    message?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        ...init,
    });

    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const body = (await response.json()) as { message?: string };
            if (body.message) message = body.message;
        } catch {
            /* ignore non-JSON error bodies */
        }
        throw new Error(message);
    }

    return (await response.json()) as T;
}

export async function fetchModules(): Promise<ModuleSummary[]> {
    const res = await request<ApiEnvelope<ModuleSummary[]>>('/modules');
    return res.data ?? [];
}

export async function fetchModule(
    id: string,
    theme?: string | null,
): Promise<ModuleDetail> {
    const query = theme ? `?theme=${encodeURIComponent(theme)}` : '';
    const res = await request<ApiEnvelope<ModuleDetail>>(`/modules/${id}${query}`);
    if (!res.data) throw new Error(res.message ?? 'Module tidak ditemukan.');
    return res.data;
}

export async function checkAnswer(payload: QuizAnswer): Promise<QuizResult> {
    return request<QuizResult>('/quiz/run', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function fetchFinalProjects(): Promise<FinalProjectSummary[]> {
    const res = await request<ApiEnvelope<FinalProjectSummary[]>>('/final-projects');
    return res.data ?? [];
}

export async function fetchFinalProject(id: string): Promise<FinalProjectBrief> {
    const res = await request<ApiEnvelope<FinalProjectBrief>>(`/final-projects/${id}`);
    if (!res.data) throw new Error(res.message ?? 'Final Project tidak ditemukan.');
    return res.data;
}

export async function submitFinalProject(
    id: string,
    html: string,
    css: string,
): Promise<FinalProjectResult> {
    return request<FinalProjectResult>(`/final-projects/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ html, css }),
    });
}
