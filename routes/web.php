<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDocumentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::scopeBindings()->group(function () {
        Route::resource('employees', EmployeeController::class);

        Route::post('employees/{employee}/documents', [EmployeeDocumentController::class, 'store'])
            ->name('employees.documents.store');
        Route::post('employees/{employee}/documents/{document}/replace', [EmployeeDocumentController::class, 'replace'])
            ->name('employees.documents.replace');
        Route::delete('employees/{employee}/documents/{document}', [EmployeeDocumentController::class, 'destroy'])
            ->name('employees.documents.destroy');
        Route::get('employees/{employee}/documents/{document}/download', [EmployeeDocumentController::class, 'download'])
            ->name('employees.documents.download');
        Route::get('employees/{employee}/documents/{document}/view', [EmployeeDocumentController::class, 'view'])
            ->name('employees.documents.view');

        Route::get('employees/{employee}/profile-photo', [EmployeeController::class, 'profilePhotoView'])
            ->name('employees.profilePhoto.view');
    });

    Route::middleware([\Spatie\Permission\Middleware\RoleMiddleware::class.':Admin'])->group(function () {
        Route::resource('users', UserController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update']);
    });
});

require __DIR__.'/auth.php';
