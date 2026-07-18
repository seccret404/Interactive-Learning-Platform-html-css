/**
 * Shared domain types for the learning platform.
 * Mirrors the JSON served by the Laravel API.
 */

export interface Slide {
    title: string;
    content: string;
    image?: string;
}

/** Multiple-choice question: pick one option by index. */
export interface MultipleChoiceQuestion {
    type: 'multiple_choice';
    question: string;
    options: string[];
}

/** Code identification: click the correct code fragment. */
export interface IdentifyQuestion {
    type: 'identify';
    prompt: string;
    code_parts: string[];
}

/**
 * Fill-in-the-code: the template contains blank markers `[[0]]`, `[[1]]`, ...
 * The learner fills each unique blank index with the missing token.
 */
export interface FillCodeQuestion {
    type: 'fill_code';
    prompt: string;
    template: string;
}

/** Case-based code editor, validated server-side against hidden test cases. */
export interface EditorQuestion {
    type: 'editor';
    study_case: string;
    hint: string;
    starter_code: string;
    language: 'html' | 'css';
}

export type Question =
    | MultipleChoiceQuestion
    | IdentifyQuestion
    | FillCodeQuestion
    | EditorQuestion;

/** The public quiz shape: an ordered list of questions of mixed types. */
export interface Quiz {
    questions: Question[];
}

export interface SubModule {
    id: number;
    title: string;
    description: string;
    slides?: Slide[];
    quiz?: Quiz;
}

export interface ModuleSummary {
    id: string;
    title: string;
    icon: string;
    order: number;
    description: string;
    requires: string[];
    subModules: Pick<SubModule, 'id' | 'title' | 'description'>[];
}

export interface ModuleDetail extends ModuleSummary {
    subModules: SubModule[];
}

/** Answer to a single question submitted to POST /api/quiz/run. */
export interface QuizAnswer {
    moduleId: string;
    subModuleId: number;
    questionIndex: number;
    /** Chosen index (multiple_choice / identify) or blank values (fill_code). */
    answer?: number | string[];
    /** Editor code submission. */
    code?: string;
    /** Case-study theme (a–e), needed to grade the matching editor variant. */
    theme?: string | null;
}

/** Result returned by POST /api/quiz/run. */
export interface QuizResult {
    success: boolean;
    correct: boolean;
    output: string;
    /** Feedback message for the answered question (correct or wrong). */
    feedback?: string;
    /** Per-test-case breakdown, present for editor questions. */
    results?: { passed: boolean; message: string }[];
}

/** A single recorded attempt, stored per quiz in localStorage. */
export interface Attempt {
    id: string;
    moduleId: string;
    subModuleId: number;
    time: string; // HH:mm
    timestamp: number;
    correct: boolean;
    code: string;
}

/** The learner's editable profile (session-only, like all progress). */
export interface UserProfile {
    name: string;
    kelas: string;
}

/** The full progress object persisted in localStorage. */
export interface SessionProgress {
    currentModule: string | null;
    currentSubModule: number | null;
    /** Composite keys "moduleId:subModuleId" of completed quizzes. */
    completedQuiz: string[];
    /** Module ids that are fully completed (all sub-modules done). */
    completedModules: string[];
    attempts: Attempt[];
    /**
     * The learner's case-study theme (a–e) for this session. Assigned randomly
     * on first load and used for both quiz editor variants and the Final
     * Project brief, so each learner works on a different (but equal-level)
     * context.
     */
    theme: string | null;
    /** The learner's profile, or null until they set it. */
    profile: UserProfile | null;
}

/* ------------------------------------------------------------------ */
/* Final Project                                                      */
/* ------------------------------------------------------------------ */

/** Lightweight entry for the theme picker. */
export interface FinalProjectSummary {
    id: string;
    theme: string;
    title: string;
}

/** One labelled block of the brief's reference content. */
export interface KontenEntry {
    label: string;
    value?: string;
    items?: string[];
    table?: { headers: string[]; rows: string[][] };
}

/** A public grading criterion (label + weight, no matching rules). */
export interface FinalProjectCriterion {
    id: string;
    label: string;
    aspect: string;
    points: number;
}

/** The full public brief served for a chosen theme. */
export interface FinalProjectBrief {
    id: string;
    order: number;
    theme: string;
    title: string;
    narasi: string;
    client_needs: string[];
    konten: KontenEntry[];
    html_requirements: string[];
    css_requirements: string[];
    petunjuk: string[];
    starter_html: string;
    starter_css: string;
    criteria: FinalProjectCriterion[];
}

/** A criterion after grading. */
export interface GradedCriterion extends FinalProjectCriterion {
    earned: number;
    passed: boolean;
}

/** Result returned by POST /api/final-projects/{id}/submit. */
export interface FinalProjectResult {
    success: boolean;
    score: number;
    maxScore: number;
    passedCount: number;
    totalCount: number;
    aspects: { aspect: string; earned: number; max: number }[];
    criteria: GradedCriterion[];
    feedback: string;
    complete: boolean;
}
