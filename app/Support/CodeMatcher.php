<?php

namespace App\Support;

/**
 * Static pattern-matching helpers shared by the quiz and final-project graders.
 *
 * Matching is purely static (no code execution) and tolerant of casing and
 * whitespace, so learners are not penalised for indentation or capitalisation.
 */
class CodeMatcher
{
    /**
     * Normalize code/text for comparison: lowercase, collapse whitespace, trim.
     */
    public static function normalize(string $code): string
    {
        $code = strtolower($code);
        $code = preg_replace('/\s+/', ' ', $code) ?? $code;

        return trim($code);
    }

    /**
     * Run a single test against already-normalized code.
     *
     * Supported types: contains, not_contains, count, regex, equals.
     *
     * @param  array<string, mixed>  $test
     */
    public static function matches(array $test, string $normalizedCode): bool
    {
        $type = $test['type'] ?? 'contains';
        $value = self::normalize((string) ($test['value'] ?? ''));

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
     * True only when every test in the list passes against the code.
     *
     * @param  array<int, array<string, mixed>>  $tests
     */
    public static function all(array $tests, string $normalizedCode): bool
    {
        foreach ($tests as $test) {
            if (! self::matches($test, $normalizedCode)) {
                return false;
            }
        }

        return ! empty($tests);
    }
}
