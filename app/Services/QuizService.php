<?php

namespace App\Services;

use App\Support\CodeMatcher;

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
        $questions = $this->modules->questionsFor($moduleId, $subModuleId, $payload['theme'] ?? null);
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
            $user = CodeMatcher::normalize((string) ($given[$i] ?? ''));
            $acceptedNormalized = array_map(fn ($v) => CodeMatcher::normalize((string) $v), (array) $accepted);

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
        $normalized = CodeMatcher::normalize($code);

        if (empty($testCases)) {
            $expected = CodeMatcher::normalize($question['expected_output'] ?? '');
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
            $passed = CodeMatcher::matches($test, $normalized);
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
}
