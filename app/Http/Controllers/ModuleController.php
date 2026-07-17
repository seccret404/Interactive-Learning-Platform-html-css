<?php

namespace App\Http\Controllers;

use App\Services\ModuleService;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    public function __construct(protected ModuleService $modules) {}

    /**
     * GET /api/modules — list of modules for the main menu.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->modules->listing(),
        ]);
    }

    /**
     * GET /api/modules/{id} — full module detail (slides + public quiz fields).
     */
    public function show(string $id): JsonResponse
    {
        $module = $this->modules->detail($id);

        if ($module === null) {
            return response()->json([
                'success' => false,
                'message' => 'Module tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $module,
        ]);
    }
}
