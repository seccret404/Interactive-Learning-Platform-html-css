<?php

namespace Tests\Feature;

use Tests\TestCase;

class FinalProjectApiTest extends TestCase
{
    private string $fullHtml = <<<'HTML'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>SMK Harapan Bangsa</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header><h1>SMK Harapan Bangsa</h1></header>
  <nav>
    <a href="index.html">Beranda</a>
    <a href="profil.html">Profil</a>
    <a href="kontak.html">Kontak</a>
  </nav>
  <main>
    <p>SMK Harapan Bangsa adalah sekolah kejuruan.</p>
    <p>Sekolah ini memiliki banyak program keahlian.</p>
    <img src="sekolah.jpg" alt="Gedung SMK Harapan Bangsa">
    <ul>
      <li>Rekayasa Perangkat Lunak</li>
      <li>Teknik Komputer dan Jaringan</li>
      <li>Desain Komunikasi Visual</li>
    </ul>
    <table>
      <tr><th>Nama</th><th>Kelas</th></tr>
      <tr><td>Andi</td><td>XI RPL</td></tr>
    </table>
  </main>
  <footer><p>Website Profil SMK Harapan Bangsa</p></footer>
</body>
</html>
HTML;

    private string $fullCss = <<<'CSS'
body { font-family: Arial; color: black; }
header { background-color: darkblue; color: white; padding: 20px; }
nav { display: flex; gap: 20px; padding: 15px; }
.card { border: 1px solid gray; margin: 10px; }
h1 { font-size: 32px; }
CSS;

    public function test_listing_returns_five_themes(): void
    {
        $this->getJson('/api/final-projects')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(5, 'data');
    }

    public function test_brief_hides_grading_key(): void
    {
        $response = $this->getJson('/api/final-projects/a')->assertOk();

        $this->assertNotEmpty($response->json('data.criteria'));

        $raw = $response->getContent();
        $this->assertStringNotContainsString('"tests"', $raw);
        $this->assertStringNotContainsString('feedback', $raw);
    }

    public function test_complete_submission_scores_full_marks(): void
    {
        $this->postJson('/api/final-projects/a/submit', [
            'html' => $this->fullHtml,
            'css' => $this->fullCss,
        ])
            ->assertOk()
            ->assertJsonPath('score', 100)
            ->assertJsonPath('complete', true);
    }

    public function test_partial_submission_scores_below_full(): void
    {
        $response = $this->postJson('/api/final-projects/a/submit', [
            'html' => $this->fullHtml,
            'css' => '',
        ])->assertOk();

        $this->assertLessThan(100, $response->json('score'));
        $this->assertFalse($response->json('complete'));
    }

    public function test_unknown_theme_returns_404(): void
    {
        $this->getJson('/api/final-projects/zzz')->assertNotFound();
        $this->postJson('/api/final-projects/zzz/submit', ['html' => '', 'css' => ''])
            ->assertNotFound();
    }
}
