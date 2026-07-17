<?php

namespace Tests\Feature;

use Tests\TestCase;

class ModuleApiTest extends TestCase
{
    public function test_modules_listing_returns_html_and_css(): void
    {
        $response = $this->getJson('/api/modules');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id', 'html')
            ->assertJsonPath('data.1.id', 'css');
    }

    public function test_module_detail_includes_slides_but_hides_quiz_answers(): void
    {
        $response = $this->getJson('/api/modules/html');

        $response->assertOk()
            ->assertJsonPath('data.id', 'html')
            ->assertJsonPath('data.subModules.0.quiz.questions.0.type', 'multiple_choice');

        // The answer key must never reach the client, for any question type.
        $raw = $response->getContent();
        $this->assertStringNotContainsString('"answer"', $raw);
        $this->assertStringNotContainsString('test_cases', $raw);
        $this->assertStringNotContainsString('"blanks"', $raw);
        $this->assertStringNotContainsString('expected_output', $raw);
        $this->assertStringNotContainsString('feedback_correct', $raw);
    }

    public function test_unknown_module_returns_404(): void
    {
        $this->getJson('/api/modules/does-not-exist')->assertNotFound();
    }
}
