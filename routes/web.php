<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| The React single-page application is served from a single blade view.
| Every non-API route returns the SPA shell so React Router can handle
| client-side routing (/, /module/:id, .../theory/:sub, .../quiz/:sub).
*/

Route::view('/{any?}', 'app')->where('any', '^(?!api).*$');
