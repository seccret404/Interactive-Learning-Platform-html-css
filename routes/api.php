<?php

use App\Http\Controllers\FinalProjectController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All endpoints are prefixed with /api (configured in bootstrap/app.php).
*/

Route::get('/modules', [ModuleController::class, 'index']);
Route::get('/modules/{id}', [ModuleController::class, 'show']);

Route::post('/quiz/run', [QuizController::class, 'run']);

Route::get('/final-projects', [FinalProjectController::class, 'index']);
Route::get('/final-projects/{id}', [FinalProjectController::class, 'show']);
Route::post('/final-projects/{id}/submit', [FinalProjectController::class, 'submit']);
