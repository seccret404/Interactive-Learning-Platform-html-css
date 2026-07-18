<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

/**
 * Reads learning modules from JSON files in storage/modules.
 *
 * The platform is database-less: each top-level module (HTML, CSS, ...) lives
 * in its own JSON file. Adding a new module only requires dropping a new JSON
 * file into storage/modules — no code change needed.
 */
class ModuleService
{
    /**
     * Absolute path to the directory holding module JSON files.
     */
    protected function modulesPath(): string
    {
        return storage_path('modules');
    }

    /**
     * Load every module file, decoded and sorted by their "order" field.
     *
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        $path = $this->modulesPath();

        if (! File::isDirectory($path)) {
            return [];
        }

        $modules = [];

        foreach (File::glob($path.DIRECTORY_SEPARATOR.'*.json') as $file) {
            $decoded = json_decode(File::get($file), true);

            if (is_array($decoded) && isset($decoded['id'])) {
                $modules[] = $decoded;
            }
        }

        usort($modules, fn ($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));

        return $modules;
    }

    /**
     * Find a single raw module by its id (e.g. "html").
     *
     * @return array<string, mixed>|null
     */
    public function find(string $id): ?array
    {
        foreach ($this->all() as $module) {
            if (($module['id'] ?? null) === $id) {
                return $module;
            }
        }

        return null;
    }

    /**
     * Module list for the main menu. Quiz answers and slides are stripped to
     * keep the payload light and avoid leaking validation data.
     *
     * @return array<int, array<string, mixed>>
     */
    public function listing(): array
    {
        return array_map(function (array $module) {
            return [
                'id' => $module['id'],
                'title' => $module['title'],
                'icon' => $module['icon'] ?? 'book-open',
                'order' => $module['order'] ?? 0,
                'description' => $module['description'] ?? '',
                'requires' => $module['requires'] ?? [],
                'subModules' => array_map(fn (array $sub) => [
                    'id' => $sub['id'],
                    'title' => $sub['title'],
                    'description' => $sub['description'] ?? '',
                ], $module['subModules'] ?? []),
            ];
        }, $this->all());
    }

    /**
     * Full module detail for theory + quiz pages. Every quiz question is passed
     * through publicQuestion(), which whitelists the fields safe to expose and
     * strips the answer key (answer, blanks, test_cases, expected_output,
     * feedback) so it never reaches the client.
     *
     * @return array<string, mixed>|null
     */
    public function detail(string $id, ?string $theme = null): ?array
    {
        $module = $this->find($id);

        if ($module === null) {
            return null;
        }

        $module['subModules'] = array_map(function (array $sub) use ($id, $theme) {
            $questions = $this->questionsForSub($sub);

            if ($questions !== null) {
                $sub['quiz'] = [
                    'questions' => array_map(
                        fn (array $q) => $this->publicQuestion($q, $id, $theme),
                        $questions,
                    ),
                ];
            }

            return $sub;
        }, $module['subModules'] ?? []);

        return $module;
    }

    /**
     * The raw list of questions (with answer keys) for a specific sub-module.
     * Used server-side only, by the QuizService.
     *
     * @return array<int, array<string, mixed>>
     */
    public function questionsFor(string $moduleId, int $subModuleId, ?string $theme = null): array
    {
        $module = $this->find($moduleId);

        foreach ($module['subModules'] ?? [] as $sub) {
            if (($sub['id'] ?? null) === $subModuleId) {
                $questions = $this->questionsForSub($sub) ?? [];

                return array_map(fn (array $q) => $this->resolveVariant($q, $theme), $questions);
            }
        }

        return [];
    }

    /**
     * Resolve a themed editor question to the variant for the given theme.
     * Non-variant questions (and non-editor types) are returned unchanged.
     *
     * A themed editor question looks like:
     *   { "type": "editor", "variants": { "a": {...}, "b": {...}, ... } }
     * The variant merges up to a flat editor question (study_case, hint,
     * starter_code, test_cases, ...).
     *
     * @param  array<string, mixed>  $q
     * @return array<string, mixed>
     */
    protected function resolveVariant(array $q, ?string $theme): array
    {
        if (($q['type'] ?? 'editor') !== 'editor' || ! isset($q['variants']) || ! is_array($q['variants'])) {
            return $q;
        }

        $variants = $q['variants'];
        $chosen = $variants[$theme] ?? reset($variants);

        if (! is_array($chosen)) {
            return $q;
        }

        return array_merge(['type' => 'editor'], $chosen);
    }

    /**
     * Extract the question list from a sub-module, tolerating the shape of the
     * quiz block (either { "questions": [...] } or a legacy single-quiz object).
     *
     * @param  array<string, mixed>  $sub
     * @return array<int, array<string, mixed>>|null
     */
    protected function questionsForSub(array $sub): ?array
    {
        if (! isset($sub['quiz'])) {
            return null;
        }

        $quiz = $sub['quiz'];

        if (isset($quiz['questions']) && is_array($quiz['questions'])) {
            return array_values($quiz['questions']);
        }

        // Legacy shape: the quiz object itself is a single editor question.
        return [$quiz + ['type' => 'editor']];
    }

    /**
     * Whitelist the client-safe fields of a single question by type. The answer
     * key (answer, blanks, test_cases, expected_output, feedback_*) is dropped.
     *
     * @param  array<string, mixed>  $q
     * @return array<string, mixed>
     */
    protected function publicQuestion(array $q, string $moduleId, ?string $theme = null): array
    {
        $q = $this->resolveVariant($q, $theme);
        $type = $q['type'] ?? 'editor';

        return match ($type) {
            'multiple_choice' => [
                'type' => 'multiple_choice',
                'question' => $q['question'] ?? '',
                'options' => array_values($q['options'] ?? []),
            ],
            'identify' => [
                'type' => 'identify',
                'prompt' => $q['prompt'] ?? '',
                'code_parts' => array_values($q['code_parts'] ?? []),
            ],
            'fill_code' => [
                'type' => 'fill_code',
                'prompt' => $q['prompt'] ?? '',
                'template' => $q['template'] ?? '',
            ],
            default => [
                'type' => 'editor',
                'study_case' => $q['study_case'] ?? '',
                'hint' => $q['hint'] ?? '',
                'starter_code' => $q['starter_code'] ?? '',
                'language' => $q['language'] ?? $this->languageFor($moduleId),
            ],
        };
    }

    /**
     * Monaco editor language hint derived from the module id.
     */
    protected function languageFor(string $moduleId): string
    {
        return $moduleId === 'css' ? 'css' : 'html';
    }
}
