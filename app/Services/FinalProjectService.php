<?php

namespace App\Services;

use App\Support\CodeMatcher;
use Illuminate\Support\Facades\File;

/**
 * Reads Final Project briefs from JSON files in storage/final-projects and
 * grades a submitted website (index.html + style.css) against a rubric of
 * order-independent indicators.
 *
 * Like the modules, this is database-less: each theme (A–E) lives in its own
 * JSON file. The grading answer key (criteria tests, feedback wording) is kept
 * server-side and stripped from the public brief.
 */
class FinalProjectService
{
    protected function path(): string
    {
        return storage_path('final-projects');
    }

    /**
     * Every brief, decoded and sorted by "order".
     *
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        $path = $this->path();

        if (! File::isDirectory($path)) {
            return [];
        }

        $briefs = [];

        foreach (File::glob($path.DIRECTORY_SEPARATOR.'*.json') as $file) {
            $decoded = json_decode(File::get($file), true);

            if (is_array($decoded) && isset($decoded['id'])) {
                $briefs[] = $decoded;
            }
        }

        usort($briefs, fn ($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));

        return $briefs;
    }

    /**
     * A single raw brief by id (e.g. "a").
     *
     * @return array<string, mixed>|null
     */
    public function find(string $id): ?array
    {
        foreach ($this->all() as $brief) {
            if (($brief['id'] ?? null) === $id) {
                return $brief;
            }
        }

        return null;
    }

    /**
     * Lightweight list for the theme picker: id, theme, and title only.
     *
     * @return array<int, array<string, string>>
     */
    public function listing(): array
    {
        return array_map(fn (array $b) => [
            'id' => $b['id'],
            'theme' => $b['theme'] ?? '',
            'title' => $b['title'] ?? '',
        ], $this->all());
    }

    /**
     * Public brief for the project page. The grading key is removed: each
     * criterion keeps its label/aspect/points but loses its `tests`, and the
     * feedback wording is dropped (returned only on submit).
     *
     * @return array<string, mixed>|null
     */
    public function brief(string $id): ?array
    {
        $brief = $this->find($id);

        if ($brief === null) {
            return null;
        }

        $brief['criteria'] = array_map(fn (array $c) => [
            'id' => $c['id'],
            'label' => $c['label'] ?? '',
            'aspect' => $c['aspect'] ?? '',
            'points' => $c['points'] ?? 0,
        ], $brief['criteria'] ?? []);

        unset($brief['feedback']);

        return $brief;
    }

    /**
     * Grade a submission against the brief's criteria.
     *
     * @return array<string, mixed>
     */
    public function grade(string $id, string $html, string $css): array
    {
        $brief = $this->find($id);

        if ($brief === null) {
            return ['success' => false, 'message' => 'Final Project tidak ditemukan.'];
        }

        $normalized = [
            'html' => CodeMatcher::normalize($html),
            'css' => CodeMatcher::normalize($css),
        ];

        $criteria = [];
        $aspects = [];
        $score = 0;
        $passedCount = 0;

        foreach ($brief['criteria'] ?? [] as $c) {
            $points = (int) ($c['points'] ?? 0);
            $file = $c['file'] ?? 'html';

            if ($file === 'tidiness') {
                $earned = $this->tidinessScore($html, $css, $points);
                $passed = $earned >= $points; // full credit counts as "passed"
            } else {
                $passed = CodeMatcher::all($c['tests'] ?? [], $normalized[$file] ?? '');
                $earned = $passed ? $points : 0;
            }

            $score += $earned;
            $passedCount += $passed ? 1 : 0;

            $criteria[] = [
                'id' => $c['id'],
                'label' => $c['label'] ?? '',
                'aspect' => $c['aspect'] ?? '',
                'points' => $points,
                'earned' => $earned,
                'passed' => $passed,
            ];

            $aspect = $c['aspect'] ?? 'Lainnya';
            $aspects[$aspect]['aspect'] = $aspect;
            $aspects[$aspect]['earned'] = ($aspects[$aspect]['earned'] ?? 0) + $earned;
            $aspects[$aspect]['max'] = ($aspects[$aspect]['max'] ?? 0) + $points;
        }

        $totalCount = count($criteria);
        $feedback = $this->pickFeedback($brief, $aspects, $passedCount, $totalCount);

        return [
            'success' => true,
            'score' => $score,
            'maxScore' => 100,
            'passedCount' => $passedCount,
            'totalCount' => $totalCount,
            'aspects' => array_values($aspects),
            'criteria' => $criteria,
            'feedback' => $feedback,
            'complete' => $passedCount === $totalCount,
        ];
    }

    /**
     * Heuristic "kerapian" (tidiness) score: rewards indentation and readable
     * line lengths. Lenient by design — never penalises correct code harshly.
     */
    protected function tidinessScore(string $html, string $css, int $points): int
    {
        $code = $html."\n".$css;
        $lines = preg_split('/\r\n|\r|\n/', $code) ?: [];

        $hasIndent = false;
        $maxLen = 0;
        foreach ($lines as $line) {
            if (preg_match('/^[ \t]+\S/', $line)) {
                $hasIndent = true;
            }
            $maxLen = max($maxLen, strlen(rtrim($line)));
        }

        $notMinified = count(array_filter($lines, fn ($l) => trim($l) !== '')) >= 3 && $maxLen <= 400;

        $met = ($hasIndent ? 1 : 0) + ($notMinified ? 1 : 0);

        return (int) round($points * ($met / 2));
    }

    /**
     * Choose the feedback message that matches how complete the submission is.
     *
     * @param  array<string, mixed>  $brief
     * @param  array<string, array<string, int>>  $aspects
     */
    protected function pickFeedback(array $brief, array $aspects, int $passedCount, int $totalCount): string
    {
        $messages = $brief['feedback'] ?? [];

        $ratio = function (array $names) use ($aspects): float {
            $earned = 0;
            $max = 0;
            foreach ($names as $name) {
                $earned += $aspects[$name]['earned'] ?? 0;
                $max += $aspects[$name]['max'] ?? 0;
            }
            return $max > 0 ? $earned / $max : 1.0;
        };

        $overall = $ratio(['Struktur HTML', 'Elemen HTML', 'Penerapan CSS', 'Layout', 'Kesesuaian brief', 'Kerapian']);
        $htmlOk = $ratio(['Struktur HTML', 'Elemen HTML']) >= 0.8;
        $cssOk = $ratio(['Penerapan CSS', 'Layout']) >= 0.8;
        $briefOk = $ratio(['Kesesuaian brief']) >= 0.8;

        if ($passedCount === $totalCount) {
            return $messages['complete'] ?? 'Selamat! Final Project selesai.';
        }

        // Structure fundamentally weak, or very little done overall.
        if (! $htmlOk || $overall < 0.5) {
            return $messages['incomplete'] ?? 'Website belum memenuhi kebutuhan klien. Periksa kembali checklist.';
        }

        if (! $cssOk) {
            return $messages['css_incomplete'] ?? 'Struktur sudah baik, lengkapi tampilan CSS-nya.';
        }

        if (! $briefOk) {
            return $messages['content_incomplete'] ?? 'Tampilan menarik, tetapi konten klien belum lengkap.';
        }

        // High score with only minor gaps left.
        return $messages['almost'] ?? 'Sudah sangat baik! Periksa indikator yang belum tercentang.';
    }
}
