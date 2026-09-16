<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

/*
|--------------------------------------------------------------------------
| Student API / CRUD
|--------------------------------------------------------------------------
*/

Route::apiResource('student', StudentController::class);

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    Route::get('/dashboard', DashboardController::class)
        ->name('dashboard');

    Route::get('/students', function () {
        return Inertia::render('students');
    })->name('students');

});

require __DIR__.'/settings.php';