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

/** A single recorded attempt, stored per quiz in sessionStorage. */
export interface Attempt {
    id: string;
    moduleId: string;
    subModuleId: number;
    time: string; // HH:mm
    timestamp: number;
    correct: boolean;
    code: string;
}

/** The full progress object persisted in sessionStorage. */
export interface SessionProgress {
    currentModule: string | null;
    currentSubModule: number | null;
    /** Composite keys "moduleId:subModuleId" of completed quizzes. */
    completedQuiz: string[];
    /** Module ids that are fully completed (all sub-modules done). */
    completedModules: string[];
    attempts: Attempt[];
}
