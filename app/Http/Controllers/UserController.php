<?php

namespace App\Http\Controllers;

use App\Actions\Users\SyncUserEmployeeLinkAction;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    private const ALLOWED_ROLES = [
        'Admin',
        'Management',
        'Sales and Marketing',
        'Accounting and Finance',
        'Human Resources',
    ];

    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        $query = User::query()->with([
            'roles',
            'employee:id,employee_code,display_name,user_id',
        ]);

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->toString()) {
            if (in_array($status, ['active', 'inactive'], true)) {
                $query->where('status', $status);
            }
        }

        return Inertia::render('Modules/Users/Pages/Index', [
            'users' => $query->orderBy('name')->paginate(15)->withQueryString(),
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => ['active', 'inactive'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Users/Pages/Create', [
            'roles' => self::ALLOWED_ROLES,
            'statusOptions' => ['active', 'inactive'],
            'employeesForLink' => $this->employeesAvailableForUserLink(),
        ]);
    }

    public function store(UserStoreRequest $request, SyncUserEmployeeLinkAction $linkEmployee): RedirectResponse
    {
        $data = $request->validated();
        $rawEmployeeId = $data['employee_id'] ?? null;
        unset($data['employee_id']);
        $employeeId = $rawEmployeeId !== null ? (int) $rawEmployeeId : null;

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'],
        ]);

        $user->syncRoles([$data['role']]);

        $linkEmployee->execute($user, $employeeId);

        return redirect()->route('settings.users.show', $user)->with('success', 'User created.');
    }

    public function show(User $user): Response
    {
        $user->load([
            'roles',
            'employee:id,employee_code,display_name,user_id',
        ]);

        return Inertia::render('Modules/Users/Pages/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load([
            'roles',
            'employee:id,employee_code,display_name,user_id',
        ]);

        return Inertia::render('Modules/Users/Pages/Edit', [
            'user' => $user,
            'roles' => self::ALLOWED_ROLES,
            'statusOptions' => ['active', 'inactive'],
            'employeesForLink' => $this->employeesAvailableForUserLink($user),
        ]);
    }

    public function update(
        UserUpdateRequest $request,
        User $user,
        SyncUserEmployeeLinkAction $linkEmployee
    ): RedirectResponse {
        $data = $request->validated();
        $rawEmployeeId = $data['employee_id'] ?? null;
        unset($data['employee_id']);
        $employeeId = $rawEmployeeId !== null ? (int) $rawEmployeeId : null;

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'status' => $data['status'],
        ]);

        if (! empty($data['password'])) {
            $user->update(['password' => Hash::make($data['password'])]);
        }

        $user->syncRoles([$data['role']]);

        $linkEmployee->execute($user, $employeeId);

        return redirect()->route('settings.users.show', $user)->with('success', 'User updated.');
    }

    /**
     * Employees that can be linked: unlinked, or already linked to the given user (e.g. edit form).
     *
     * @return \Illuminate\Support\Collection<int, \App\Models\Employee>
     */
    private function employeesAvailableForUserLink(?User $user = null): \Illuminate\Support\Collection
    {
        return Employee::query()
            ->select(['id', 'employee_code', 'display_name'])
            ->where(function ($q) use ($user) {
                $q->whereNull('user_id');
                if ($user) {
                    $q->orWhere('user_id', $user->id);
                }
            })
            ->orderBy('display_name')
            ->get();
    }
}
