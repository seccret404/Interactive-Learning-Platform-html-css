<?php

namespace App\Services;

/**
 * Validates a single quiz question submitted by the user against the answer key
 * defined in the module JSON. Validation is purely static — no user code is ever
 * executed — and the answer key never leaves the server (see ModuleService).
 *
 * A sub-module quiz is a sequence of questions. Each question has a "type":
 *  - multiple_choice: user picks an option index; must equal "answer".
 *  - identify:        user clicks a code fragment index; must equal "answer".
 *  - fill_code:       user fills one or more blanks; each must match "blanks".
 *  - editor:          user writes code; validated against "test_cases".
 */
class QuizService
{
    public function __construct(protected ModuleService $modules) {}

    /**
     * Validate the answer to a single question inside a sub-module quiz.
     *
     * @param  array<string, mixed>  $payload  { answer?: int|string[], code?: string }
     * @return array{success: bool, correct: bool, output: string, feedback: string, results: array<int, array<string, mixed>>}
     */
    public function check(string $moduleId, int $subModuleId, int $questionIndex, array $payload): array
    {
        $questions = $this->modules->questionsFor($moduleId, $subModuleId);
        $question = $questions[$questionIndex] ?? null;

        if ($question === null) {
            return $this->fail('Soal tidak ditemukan.');
        }

        $type = $question['type'] ?? 'editor';

        return match ($type) {
            'multiple_choice', 'identify' => $this->checkChoice($question, $payload['answer'] ?? null),
            'fill_code' => $this->checkFill($question, $payload['answer'] ?? []),
            'editor' => $this->checkEditor($question, (string) ($payload['code'] ?? '')),
            default => $this->fail('Tipe soal tidak dikenali.'),
        };
    }

    /**
     * Multiple-choice / identify: the chosen index must equal the answer index.
     *
     * @param  array<string, mixed>  $question
     */
    protected function checkChoice(array $question, mixed $answer): array
    {
        $correct = is_numeric($answer) && (int) $answer === (int) ($question['answer'] ?? -1);

        return $this->result($correct, $question);
    }

    /**
     * Fill-in-the-code: every blank must match one of its accepted values.
     * "blanks" is an array (per blank) of accepted string values.
     *
     * @param  array<string, mixed>  $question
     * @param  mixed  $answer  array of user-entered strings, one per blank
     */
    protected function checkFill(array $question, mixed $answer): array
    {
        $blanks = $question['blanks'] ?? [];
        $given = is_array($answer) ? array_values($answer) : [$answer];

        $correct = ! empty($blanks);

        foreach ($blanks as $i => $accepted) {
            $user = $this->normalize((string) ($given[$i] ?? ''));
            $acceptedNormalized = array_map(fn ($v) => $this->normalize((string) $v), (array) $accepted);

            if (! in_array($user, $acceptedNormalized, true)) {
                $correct = false;
                break;
            }
        }

        return $this->result($correct, $question);
    }

    /**
     * Editor: run the submitted code against the question's test cases. Falls
     * back to comparing against expected_output when no test cases are defined.
     *
     * @param  array<string, mixed>  $question
     */
    protected function checkEditor(array $question, string $code): array
    {
        $testCases = $question['test_cases'] ?? [];
        $normalized = $this->normalize($code);

        if (empty($testCases)) {
            $expected = $this->normalize($question['expected_output'] ?? '');
            $correct = $expected !== '' && $normalized === $expected;

            return [
                'success' => true,
                'correct' => $correct,
                'output' => $correct ? 'Correct' : 'Wrong Answer',
                'feedback' => $correct
                    ? ($question['feedback_correct'] ?? '')
                    : ($question['feedback_wrong'] ?? ''),
                'results' => [],
            ];
        }

        $results = [];
        $allPassed = true;

        foreach ($testCases as $test) {
            $passed = $this->runCase($test, $normalized);
            $allPassed = $allPassed && $passed;

            $results[] = [
                'passed' => $passed,
                'message' => $test['message'] ?? '',
            ];
        }

        return [
            'success' => true,
            'correct' => $allPassed,
            'output' => $allPassed ? 'Correct' : 'Wrong Answer',
            'feedback' => $allPassed
                ? ($question['feedback_correct'] ?? '')
                : ($question['feedback_wrong'] ?? ''),
            'results' => $results,
        ];
    }

    /**
     * Build a standard result payload for choice/fill questions, picking the
     * right feedback message from the question definition.
     *
     * @param  array<string, mixed>  $question
     */
    protected function result(bool $correct, array $question): array
    {
        return [
            'success' => true,
            'correct' => $correct,
            'output' => $correct ? 'Correct' : 'Wrong Answer',
            'feedback' => $correct
                ? ($question['feedback_correct'] ?? '')
                : ($question['feedback_wrong'] ?? ''),
            'results' => [],
        ];
    }

    /**
     * A generic failure payload (e.g. question not found).
     */
    protected function fail(string $message): array
    {
        return [
            'success' => false,
            'correct' => false,
            'output' => $message,
            'feedback' => $message,
            'results' => [],
        ];
    }

    /**
     * Run a single editor test case against the normalized code.
     *
     * Supported types: contains, not_contains, count, regex, equals.
     *
     * @param  array<string, mixed>  $test
     */
    protected function runCase(array $test, string $normalizedCode): bool
    {
        $type = $test['type'] ?? 'contains';
        $value = $this->normalize((string) ($test['value'] ?? ''));

        return match ($type) {
            'contains' => str_contains($normalizedCode, $value),
            'not_contains' => ! str_contains($normalizedCode, $value),
            'count' => substr_count($normalizedCode, $value) >= (int) ($test['min'] ?? 1),
            'regex' => (bool) @preg_match('/'.str_replace('/', '\/', $test['value'] ?? '').'/i', $normalizedCode),
            'equals' => $normalizedCode === $value,
            default => false,
        };
    }

    /**
     * Normalize code/text for comparison: lowercase, collapse whitespace, trim.
     * Makes matching tolerant of indentation and casing differences.
     */
    protected function normalize(string $code): string
    {
        $code = strtolower($code);
        $code = preg_replace('/\s+/', ' ', $code) ?? $code;

        return trim($code);
    }
}
