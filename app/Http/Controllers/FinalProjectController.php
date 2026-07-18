<?php

namespace App\Http\Controllers;

use App\Services\FinalProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinalProjectController extends Controller
{
    public function __construct(protected FinalProjectService $projects) {}

    /**
     * GET /api/final-projects — theme picker list (id, theme, title).
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->projects->listing(),
        ]);
    }

    /**
     * GET /api/final-projects/{id} — full public brief (no grading key).
     */
    public function show(string $id): JsonResponse
    {
        $brief = $this->projects->brief($id);

        if ($brief === null) {
            return response()->json([
                'success' => false,
                'message' => 'Final Project tidak ditemukan.',
            ], 404);
        }

        return response()->json(['success' => true, 'data' => $brief]);
    }

    /**
     * POST /api/final-projects/{id}/submit — grade a submitted website.
     */
    public function submit(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'html' => ['present', 'nullable', 'string'],
            'css' => ['present', 'nullable', 'string'],
        ]);

        $result = $this->projects->grade($id, $validated['html'] ?? '', $validated['css'] ?? '');

        if (! ($result['success'] ?? false)) {
            return response()->json($result, 404);
        }

        return response()->json($result);
    }
}
