# Interactive Learning Platform — HTML & CSS

Website pembelajaran interaktif untuk belajar **HTML** dan **CSS** melalui teori
berbentuk slide dan kuis coding interaktif.

Dibangun sebagai **satu project Laravel** dengan React (Vite + TypeScript) yang
berjalan di dalamnya (`resources/js`). Laravel berperan sebagai REST API +
penyaji SPA; React menangani seluruh tampilan dan routing sisi klien.

---

## Tech Stack

| Layer    | Teknologi                                                              |
| -------- | --------------------------------------------------------------------- |
| Backend  | Laravel 13, PHP 8.3+, REST API, penyimpanan JSON (tanpa database)     |
| Frontend | React 19, Vite, TypeScript, React Router, TailwindCSS 4               |
| Data     | TanStack Query (server state), Context API + `sessionStorage` (progress) |
| Editor   | Monaco Editor                                                         |
| Ikon     | Heroicons                                                             |

> **Catatan versi:** Spesifikasi menyebut Laravel 12; installer resmi kini
> memasang Laravel 13. Karena aplikasi ini hanya memakai fitur inti routing +
> filesystem, keduanya kompatibel.

---

## Prinsip Penyimpanan Data

- **Tidak menggunakan database.** Seluruh materi modul berasal dari file JSON di
  `storage/modules/` (`html.json`, `css.json`).
- **Progress hanya di `sessionStorage`** — bukan `localStorage`. Progress hilang
  saat tab/browser ditutup (sesuai requirement).
- **Menambah modul baru cukup menambah file JSON** di `storage/modules/` tanpa
  mengubah source code utama.

---

## Menjalankan Project

### Prasyarat

PHP 8.3+, Composer, Node 20+.

### Setup

```bash
composer setup        # install deps PHP & JS, generate key, build assets
```

`composer setup` menjalankan: `composer install`, menyalin `.env`,
`php artisan key:generate`, `npm install`, dan `npm run build`.

### Mode Development (hot reload)

```bash
composer dev
```

Menjalankan `php artisan serve` (http://127.0.0.1:8000) dan `npm run dev` (Vite
HMR) secara bersamaan.

### Mode Production / build statis

```bash
npm run build         # type-check (tsc) + bundling Vite
php artisan serve
```

Buka **http://127.0.0.1:8000**.

> Monaco Editor memuat workernya dari CDN saat runtime, jadi pastikan ada koneksi
> internet saat membuka halaman quiz pertama kali.

### Testing

```bash
php artisan test      # feature test untuk API modul & quiz
npm run build         # type-check TypeScript (tsc --noEmit) + build
```

---

## Alur Belajar

```
Main Menu → Module List → Theory (slide) → Popup "Start Quiz" → Quiz → Correct/Wrong
```

- **Unlock system:** sub-modul berikutnya terbuka setelah sub-modul sebelumnya
  selesai. Modul **CSS terkunci** hingga seluruh modul **HTML** selesai
  (ditentukan oleh field `requires` di JSON).
- **Jawaban benar:** sub-modul jadi *Completed*, sub-modul berikutnya terbuka,
  user kembali ke daftar modul.
- **Jawaban salah:** tetap di halaman quiz, muncul tombol **Back To Theory**
  (mengulang materi → quiz dimulai ulang).
- **Attempt history:** setiap klik **Run** dicatat (waktu + Correct/Wrong) dan
  disimpan di `sessionStorage`.

---

## REST API

| Method | Endpoint              | Deskripsi                                   |
| ------ | --------------------- | ------------------------------------------- |
| GET    | `/api/modules`        | Daftar modul untuk main menu                |
| GET    | `/api/modules/{id}`   | Detail modul (slide + field quiz publik)    |
| POST   | `/api/quiz/run`       | Validasi kode quiz, balas `correct`/`wrong` |

Contoh response `POST /api/quiz/run`:

```json
{
    "success": true,
    "correct": false,
    "output": "Wrong Answer",
    "results": [
        { "passed": false, "message": "Harus ada tag pembuka <h1>." }
    ]
}
```

Field validasi (`expected_output`, `test_cases`) **tidak pernah dikirim ke
client** — validasi dilakukan sepenuhnya di server (`QuizService`).

---

## Struktur Modul JSON

Satu file = satu modul utama (HTML / CSS) berisi banyak sub-modul:

```json
{
    "id": "html",
    "title": "HTML",
    "icon": "code-bracket",
    "order": 1,
    "requires": [],
    "subModules": [
        {
            "id": 1,
            "title": "Basic HTML",
            "description": "...",
            "slides": [{ "title": "...", "content": "...", "image": "(opsional)" }],
            "quiz": {
                "study_case": "...",
                "hint": "...",
                "starter_code": "...",
                "expected_output": "...",
                "test_cases": [
                    { "type": "contains", "value": "<h1", "message": "..." }
                ]
            }
        }
    ]
}
```

### Tipe `test_cases`

| Type           | Arti                                                        |
| -------------- | ---------------------------------------------------------- |
| `contains`     | kode harus mengandung `value`                              |
| `not_contains` | kode tidak boleh mengandung `value`                        |
| `count`        | `value` muncul minimal `min` kali                          |
| `regex`        | `value` (regex) cocok dengan kode                          |
| `equals`       | kode sama persis dengan `value` (setelah normalisasi)      |

Perbandingan bersifat *case-insensitive* dan toleran terhadap spasi/indentasi.

---

## Struktur Folder

### Backend (Laravel)

```
app/
  Http/Controllers/   ModuleController.php, QuizController.php
  Services/           ModuleService.php, QuizService.php
storage/modules/      html.json, css.json
routes/               api.php (REST), web.php (catch-all → SPA)
tests/Feature/        ModuleApiTest.php, QuizApiTest.php
```

### Frontend (`resources/js`)

```
components/   Button, Modal, ProgressBar, Slide, CodeEditor, StudyCase,
              HintCard, OutputPanel, AttemptHistory,
              common (States, ErrorBoundary, ModuleIcon)
layouts/      AppLayout
pages/        Home, Module, Theory, Quiz
context/      ProgressContext (sessionStorage)
hooks/        useModules (TanStack Query)
router/       AppRoutes
services/     api.ts (REST client)
storage/      session.ts (sessionStorage)
types/        index.ts
utils/        progress.ts (unlock rules), time.ts
```

---

## Arsitektur & Best Practice

- **Clean architecture / SOLID:** logika baca modul & validasi quiz dipisah ke
  Service classes; controller tipis.
- **Reusable functional components + custom hooks + TypeScript** di seluruh frontend.
- **Aturan unlock murni** (`utils/progress.ts`) — mudah diuji, lepas dari React.
- **Error Boundary**, **loading state**, dan **empty state** tersedia di setiap
  halaman yang memuat data.
- **Routing SPA:** semua rute non-`/api` dilayani oleh satu blade view (`app.blade.php`).

---

## Routing Frontend

| Path                                     | Halaman      |
| ---------------------------------------- | ------------ |
| `/`                                      | Main Menu    |
| `/module/:moduleId`                      | Module List  |
| `/module/:moduleId/theory/:subModuleId`  | Theory       |
| `/module/:moduleId/quiz/:subModuleId`    | Quiz         |
