<?php

namespace Tests\Feature;

use Tests\TestCase;

class QuizApiTest extends TestCase
{
    public function test_multiple_choice_correct_and_wrong(): void
    {
        // html / Modul 1 / question 0: "HTML digunakan untuk ..." → answer 1.
        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 1,
            'questionIndex' => 0,
            'answer' => 1,
        ])->assertOk()->assertJsonPath('correct', true)->assertJsonPath('output', 'Correct');

        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 1,
            'questionIndex' => 0,
            'answer' => 0,
        ])->assertOk()->assertJsonPath('correct', false);
    }

    public function test_fill_code_checks_every_blank(): void
    {
        // html / Modul 1 / question 3: blanks html, title, body.
        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 1,
            'questionIndex' => 3,
            'answer' => ['html', 'title', 'body'],
        ])->assertJsonPath('correct', true);

        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 1,
            'questionIndex' => 3,
            'answer' => ['html', 'head', 'body'],
        ])->assertJsonPath('correct', false);
    }

    public function test_identify_question_matches_answer_index(): void
    {
        // html / Modul 2 / question 2: attribute fragment is index 1.
        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 2,
            'questionIndex' => 2,
            'answer' => 1,
        ])->assertJsonPath('correct', true);

        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 2,
            'questionIndex' => 2,
            'answer' => 0,
        ])->assertJsonPath('correct', false);
    }

    public function test_editor_count_rule_requires_minimum_occurrences(): void
    {
        // html / Modul 2 / question 4 (editor) requires two <p> and an <h1>.
        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 2,
            'questionIndex' => 4,
            'code' => '<h1>SMK Harapan Bangsa</h1><p>Satu</p>',
        ])->assertJsonPath('correct', false);

        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 2,
            'questionIndex' => 4,
            'code' => '<h1>SMK Harapan Bangsa</h1><p>Satu</p><p>Dua</p>',
        ])->assertJsonPath('correct', true);
    }

    public function test_editor_returns_per_test_case_results(): void
    {
        $response = $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 1,
            'questionIndex' => 4,
            'code' => '<p>salah</p>',
        ]);

        $response->assertOk()->assertJsonPath('correct', false);
        $this->assertNotEmpty($response->json('results'));
    }

    public function test_validation_rejects_missing_fields(): void
    {
        // questionIndex is now required.
        $this->postJson('/api/quiz/run', [
            'moduleId' => 'html',
            'subModuleId' => 1,
        ])->assertStatus(422);
    }
}
