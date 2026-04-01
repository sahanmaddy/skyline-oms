<?php

namespace App\Http\Controllers;

use App\Actions\Employees\CreateEmployeeAction;
use App\Actions\Employees\UpdateEmployeeAction;
use App\Enums\EmployeeDocumentType;
use App\Enums\EmployeeStatus;
use App\Http\Requests\EmployeeStoreRequest;
use App\Http\Requests\EmployeeUpdateRequest;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\User;
use App\Services\Employees\EmployeeCodeGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Employee::class, 'employee');
    }

    public function index(Request $request): Response
    {
        $query = Employee::query()->with(['user', 'phoneNumbers', 'branch:id,code,name']);

        if ($search = trim((string) $request->string('q'))) {
            // Phone numbers are normalized on save (digits-only and leading zeros stripped).
            // Normalize the search term similarly so queries like "0771234567" match stored "771234567".
            $phoneSearch = preg_replace('/\D+/', '', $search) ?? '';
            $phoneSearch = ltrim($phoneSearch, '0');
            $phoneTerm = $phoneSearch !== '' ? $phoneSearch : $search;

            $query->where(function ($q) use ($search, $phoneTerm) {
                $q->where('employee_code', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('phoneNumbers', function ($p) use ($phoneTerm) {
                        $p->where('phone_number', 'like', "%{$phoneTerm}%");
                    });
            });
        }

        if ($status = $request->string('status')->toString()) {
            if (in_array($status, EmployeeStatus::values(), true)) {
                $query->where('status', $status);
            }
        }

        $employees = $query->orderBy('display_name')->paginate(15)->withQueryString()->through(
            function (Employee $employee) use ($request) {
                return array_merge($employee->toArray(), [
                    'can_view' => $request->user()?->can('view', $employee) ?? false,
                    'can_edit' => $request->user()?->can('update', $employee) ?? false,
                    'can_delete' => $request->user()?->can('delete', $employee) ?? false,
                ]);
            }
        );

        return Inertia::render('Modules/Employees/Pages/Index', [
            'employees' => $employees,
            'canCreate' => $request->user()?->can('create', Employee::class) ?? false,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => EmployeeStatus::values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Employees/Pages/Create', [
            'statusOptions' => EmployeeStatus::values(),
            'nextEmployeeCode' => app(EmployeeCodeGeneratorService::class)->nextCode(),
            'activeBranches' => Branch::query()->active()->orderBy('name')->get(['id', 'code', 'name']),
            'users' => User::query()
                ->whereDoesntHave('employee')
                ->select(['id', 'name', 'email'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(EmployeeStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $profilePhoto = $request->file('profile_photo');
        $phoneNumbers = $validated['phone_numbers'] ?? [];
        unset($validated['phone_numbers']);
        unset($validated['profile_photo']);

        $employee = app(CreateEmployeeAction::class)->execute($validated, $phoneNumbers, $profilePhoto);

        return redirect()->route('hr.employees.show', $employee)->with('success', 'Employee created.');
    }

    public function show(Employee $employee): Response
    {
        $employee->load([
            'branch:id,code,name',
            'user:id,name,email',
            'phoneNumbers',
            'documents' => fn ($q) => $q->with('uploader:id,name')->latest(),
        ]);

        return Inertia::render('Modules/Employees/Pages/Show', [
            'employee' => $employee,
            'documentTypeOptions' => EmployeeDocumentType::values(),
            'canEdit' => request()->user()?->can('update', $employee) ?? false,
            'canDelete' => request()->user()?->can('delete', $employee) ?? false,
        ]);
    }

    public function profilePhotoView(Employee $employee): \Symfony\Component\HttpFoundation\Response
    {
        $this->authorize('view', $employee);

        abort_unless(
            $employee->profile_photo_path &&
                Storage::disk('local')->exists($employee->profile_photo_path),
            404,
        );

        return Storage::disk('local')->response(
            $employee->profile_photo_path,
            basename($employee->profile_photo_path),
            [
                'Content-Disposition' => 'inline',
            ],
        );
    }

    public function edit(Employee $employee): Response
    {
        $availableUsers = User::query()
            ->whereDoesntHave('employee')
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();

        if ($employee->user_id) {
            $current = User::query()->select(['id', 'name', 'email'])->find($employee->user_id);
            if ($current) {
                $availableUsers->prepend($current);
            }
        }

        return Inertia::render('Modules/Employees/Pages/Edit', [
            'employee' => $employee->load(['branch:id,code,name', 'user:id,name,email', 'phoneNumbers']),
            'statusOptions' => EmployeeStatus::values(),
            'activeBranches' => Branch::query()
                ->where(function ($q) use ($employee) {
                    $q->where('is_active', true)
                        ->orWhere('id', $employee->branch_id);
                })
                ->orderBy('name')
                ->get(['id', 'code', 'name']),
            'users' => $availableUsers->unique('id')->values(),
        ]);
    }

    public function update(EmployeeUpdateRequest $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validated();
        $profilePhoto = $request->file('profile_photo');
        $phoneNumbers = $validated['phone_numbers'] ?? [];
        unset($validated['phone_numbers']);
        unset($validated['profile_photo']);

        app(UpdateEmployeeAction::class)->execute($employee, $validated, $phoneNumbers, $profilePhoto);

        return redirect()->route('hr.employees.show', $employee)->with('success', 'Employee updated.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();

        return redirect()->route('hr.employees.index')->with('success', 'Employee deleted.');
    }
}
