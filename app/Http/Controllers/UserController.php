<?php

namespace App\Http\Controllers;

use App\Actions\Users\SyncUserEmployeeLinkAction;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        $query = User::query()->with([
            'roles',
            'branch:id,code,name',
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

        $users = $query->orderBy('name')->paginate(15)->withQueryString()->through(
            function (User $user) use ($request) {
                return array_merge($user->toArray(), [
                    'can_view' => $request->user()?->can('view', $user) ?? false,
                    'can_edit' => $request->user()?->can('update', $user) ?? false,
                    'can_delete' => $request->user()?->can('delete', $user) ?? false,
                ]);
            }
        );

        return Inertia::render('Modules/Users/Pages/Index', [
            'users' => $users,
            'canCreate' => $request->user()?->can('create', User::class) ?? false,
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
            'roles' => $this->assignableRoleNames(),
            'statusOptions' => ['active', 'inactive'],
            'employeesForLink' => $this->employeesAvailableForUserLink(),
            'activeBranches' => $this->activeBranchesForForms(null),
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
            'branch_id' => $data['branch_id'],
        ]);

        $user->syncRoles($data['roles'] ?? []);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $linkEmployee->execute($user, $employeeId);

        return redirect()->route('settings.users.show', $user)->with('success', 'User created.');
    }

    public function show(User $user): Response
    {
        $user->load([
            'roles',
            'branch:id,code,name',
            'employee:id,employee_code,display_name,user_id',
        ]);

        return Inertia::render('Modules/Users/Pages/Show', [
            'user' => $user,
            'canEdit' => request()->user()?->can('update', $user) ?? false,
            'canDelete' => request()->user()?->can('delete', $user) ?? false,
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load([
            'roles',
            'branch:id,code,name',
            'employee:id,employee_code,display_name,user_id',
        ]);

        return Inertia::render('Modules/Users/Pages/Edit', [
            'user' => $user,
            'roles' => $this->assignableRoleNames(),
            'statusOptions' => ['active', 'inactive'],
            'employeesForLink' => $this->employeesAvailableForUserLink($user),
            'activeBranches' => $this->activeBranchesForForms($user),
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
            'branch_id' => $data['branch_id'],
        ]);

        if (! empty($data['password'])) {
            $user->update(['password' => Hash::make($data['password'])]);
        }

        $user->syncRoles($data['roles'] ?? []);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $linkEmployee->execute($user, $employeeId);

        return redirect()->route('settings.users.show', $user)->with('success', 'User updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('settings.users.index')->with('success', 'User deleted.');
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

    private function assignableRoleNames(): array
    {
        $query = Role::query()
            ->where('guard_name', 'web')
            ->orderBy('name');

        if (Schema::hasColumn('roles', 'is_active')) {
            $query->where('is_active', true);
        }

        return $query->pluck('name')->all();
    }

    /**
     * @return \Illuminate\Support\Collection<int, \App\Models\Branch>
     */
    private function activeBranchesForForms(?User $user = null): \Illuminate\Support\Collection
    {
        $query = Branch::query()->orderBy('name');

        if ($user !== null) {
            $query->where(function ($q) use ($user) {
                $q->where('is_active', true)
                    ->orWhere('id', $user->branch_id);
            });
        } else {
            $query->where('is_active', true);
        }

        return $query->get(['id', 'code', 'name']);
    }
}
