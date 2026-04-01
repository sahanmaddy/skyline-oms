<?php

use App\Http\Controllers\BranchContextController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerDocumentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDocumentController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SystemSettingsController;
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
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', function () {
            return redirect()->route('settings.profile.edit');
        })->name('index');

        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::resource('users', UserController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);

        Route::get('company', function () {
            return Inertia::render('Modules/Shared/ModulePlaceholder', [
                'area' => 'settings',
                'moduleTitle' => 'Settings',
                'headTitle' => 'Settings — Company Settings',
                'breadcrumbs' => [
                    ['label' => 'Company Settings'],
                ],
                'title' => 'Company settings',
                'description' => 'Manage organization profile, contacts, branding, and defaults.',
            ]);
        })->name('company');

        Route::get('system', [SystemSettingsController::class, 'edit'])->name('system');
        Route::patch('system/theme', [SystemSettingsController::class, 'updateTheme'])->name('system.theme');

        Route::patch('context/branch', [BranchContextController::class, 'update'])->name('context.branch');
        Route::resource('branches', BranchController::class);
    });

    Route::permanentRedirect('/profile', '/settings/profile');
    Route::permanentRedirect('/users', '/settings/users');

    Route::get('/inventory', function () {
        return Inertia::render('Modules/Shared/ModulePlaceholder', [
            'area' => 'standalone',
            'moduleTitle' => 'Inventory',
            'headTitle' => 'Inventory',
            'breadcrumbs' => [],
            'title' => 'Inventory',
            'description' => 'Stock levels, warehouses, and movements will be managed here.',
        ]);
    })->name('inventory.index');

    Route::get('/procurement', function () {
        return Inertia::render('Modules/Shared/ModulePlaceholder', [
            'area' => 'standalone',
            'moduleTitle' => 'Procurement',
            'headTitle' => 'Procurement',
            'breadcrumbs' => [],
            'title' => 'Procurement',
            'description' => 'Purchase orders and supplier workflows will appear here.',
        ]);
    })->name('procurement.index');

    Route::get('/finance', function () {
        return Inertia::render('Modules/Shared/ModulePlaceholder', [
            'area' => 'standalone',
            'moduleTitle' => 'Finance',
            'headTitle' => 'Finance',
            'breadcrumbs' => [],
            'title' => 'Finance',
            'description' => 'Accounting, ledgers, and financial reporting will be available here.',
        ]);
    })->name('finance.index');

    Route::scopeBindings()->group(function () {
        Route::prefix('hr')->name('hr.')->group(function () {
            Route::get('/', function () {
                return redirect()->route('hr.employees.index');
            })->name('index');

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

            Route::get('attendance', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'hr',
                    'moduleTitle' => 'Human Resource',
                    'headTitle' => 'Human Resource — Attendance',
                    'breadcrumbs' => [
                        ['label' => 'Attendance'],
                    ],
                    'title' => 'Attendance',
                    'description' => 'Track attendance, shifts, and time records for your workforce.',
                ]);
            })->name('attendance');

            Route::get('payroll', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'hr',
                    'moduleTitle' => 'Human Resource',
                    'headTitle' => 'Human Resource — Payroll',
                    'breadcrumbs' => [
                        ['label' => 'Payroll'],
                    ],
                    'title' => 'Payroll',
                    'description' => 'Run payroll, manage pay cycles, and export compensation reports.',
                ]);
            })->name('payroll');

            Route::get('leave', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'hr',
                    'moduleTitle' => 'Human Resource',
                    'headTitle' => 'Human Resource — Leave',
                    'breadcrumbs' => [
                        ['label' => 'Leave'],
                    ],
                    'title' => 'Leave',
                    'description' => 'Request, approve, and report on annual, sick, and other leave types.',
                ]);
            })->name('leave');

            Route::get('documents', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'hr',
                    'moduleTitle' => 'Human Resource',
                    'headTitle' => 'Human Resource — Documents',
                    'breadcrumbs' => [
                        ['label' => 'Documents'],
                    ],
                    'title' => 'Human Resource documents',
                    'description' => 'Central document library and policy acknowledgements will live here.',
                ]);
            })->name('documents');
        });

        Route::prefix('sales')->name('sales.')->group(function () {
            Route::get('/', function () {
                return redirect()->route('sales.customers.index');
            })->name('index');

            Route::resource('customers', CustomerController::class);

            Route::post('customers/{customer}/documents', [CustomerDocumentController::class, 'store'])
                ->name('customers.documents.store');
            Route::post('customers/{customer}/documents/{document}/replace', [CustomerDocumentController::class, 'replace'])
                ->name('customers.documents.replace');
            Route::delete('customers/{customer}/documents/{document}', [CustomerDocumentController::class, 'destroy'])
                ->name('customers.documents.destroy');
            Route::get('customers/{customer}/documents/{document}/download', [CustomerDocumentController::class, 'download'])
                ->name('customers.documents.download');
            Route::get('customers/{customer}/documents/{document}/view', [CustomerDocumentController::class, 'view'])
                ->name('customers.documents.view');

            Route::get('orders', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'sales',
                    'moduleTitle' => 'Sales',
                    'headTitle' => 'Sales — Orders',
                    'breadcrumbs' => [
                        ['label' => 'Sales Orders'],
                    ],
                    'title' => 'Sales orders',
                    'description' => 'Create and fulfil customer orders with full order lifecycle tracking.',
                ]);
            })->name('orders');

            Route::get('invoices', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'sales',
                    'moduleTitle' => 'Sales',
                    'headTitle' => 'Sales — Invoices',
                    'breadcrumbs' => [
                        ['label' => 'Invoices'],
                    ],
                    'title' => 'Invoices',
                    'description' => 'Issue invoices, track numbering, and sync with accounting.',
                ]);
            })->name('invoices');

            Route::get('payments', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'sales',
                    'moduleTitle' => 'Sales',
                    'headTitle' => 'Sales — Payments',
                    'breadcrumbs' => [
                        ['label' => 'Payments'],
                    ],
                    'title' => 'Payments',
                    'description' => 'Record customer payments and reconciliation against invoices.',
                ]);
            })->name('payments');

            Route::get('returns', function () {
                return Inertia::render('Modules/Shared/ModulePlaceholder', [
                    'area' => 'sales',
                    'moduleTitle' => 'Sales',
                    'headTitle' => 'Sales — Returns',
                    'breadcrumbs' => [
                        ['label' => 'Returns'],
                    ],
                    'title' => 'Returns',
                    'description' => 'Process returns, credits, and adjustments linked to original sales.',
                ]);
            })->name('returns');
        });
    });
});

require __DIR__.'/auth.php';
