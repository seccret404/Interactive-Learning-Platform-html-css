<?php

namespace App\Http\Controllers;

use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function __construct(protected QuizService $quiz) {}

    /**
     * POST /api/quiz/run — validate the answer to a single quiz question.
     *
     * Payload depends on the question type:
     *  - multiple_choice / identify: { answer: int }
     *  - fill_code:                   { answer: string[] }
     *  - editor:                      { code: string }
     */
    public function run(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'moduleId' => ['required', 'string'],
            'subModuleId' => ['required', 'integer'],
            'questionIndex' => ['required', 'integer', 'min:0'],
            'answer' => ['nullable'],
            'code' => ['nullable', 'string'],
        ]);

        $result = $this->quiz->check(
            $validated['moduleId'],
            (int) $validated['subModuleId'],
            (int) $validated['questionIndex'],
            [
                'answer' => $validated['answer'] ?? null,
                'code' => $validated['code'] ?? '',
            ],
        );

        return response()->json($result);
    }
}
