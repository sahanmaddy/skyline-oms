<?php

namespace App\Http\Controllers;

use App\Actions\Employees\CreateEmployeeAction;
use App\Actions\Employees\UpdateEmployeeAction;
use App\Enums\EmployeeDocumentType;
use App\Enums\EmployeeStatus;
use App\Http\Requests\EmployeeStoreRequest;
use App\Http\Requests\EmployeeUpdateRequest;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $query = Employee::query()->with(['user', 'phoneNumbers']);

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('employee_code', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('phoneNumbers', fn ($p) => $p->where('phone_number', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->string('status')->toString()) {
            if (in_array($status, EmployeeStatus::values(), true)) {
                $query->where('status', $status);
            }
        }

        return Inertia::render('Modules/Employees/Pages/Index', [
            'employees' => $query->orderBy('display_name')->paginate(15)->withQueryString(),
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
        $phoneNumbers = $validated['phone_numbers'] ?? [];
        unset($validated['phone_numbers']);

        $employee = app(CreateEmployeeAction::class)->execute($validated, $phoneNumbers);

        return redirect()->route('employees.show', $employee)->with('success', 'Employee created.');
    }

    public function show(Employee $employee): Response
    {
        $employee->load([
            'user:id,name,email',
            'phoneNumbers',
            'documents' => fn ($q) => $q->with('uploader:id,name')->latest(),
        ]);

        return Inertia::render('Modules/Employees/Pages/Show', [
            'employee' => $employee,
            'documentTypeOptions' => EmployeeDocumentType::values(),
        ]);
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
            'employee' => $employee->load(['user:id,name,email', 'phoneNumbers']),
            'statusOptions' => EmployeeStatus::values(),
            'users' => $availableUsers->unique('id')->values(),
        ]);
    }

    public function update(EmployeeUpdateRequest $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validated();
        $phoneNumbers = $validated['phone_numbers'] ?? [];
        unset($validated['phone_numbers']);

        app(UpdateEmployeeAction::class)->execute($employee, $validated, $phoneNumbers);

        return redirect()->route('employees.show', $employee)->with('success', 'Employee updated.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Employee deleted.');
    }
}
