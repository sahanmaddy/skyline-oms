<?php

namespace App\Http\Controllers;

use App\Actions\Users\SyncUserBranchAssignmentsAction;
use App\Actions\Users\SyncUserEmployeeLinkAction;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\Branches\BranchScopeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class UserController extends Controller
{
    public function __construct(
        private readonly BranchScopeService $branchScope,
    ) {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        $branchId = $this->branchScope->effectiveBranchId($request);

        $query = User::query()->with([
            'roles',
            'branch:id,code,name',
            'employee:id,employee_code,display_name,user_id,branch_id',
        ]);

        $this->branchScope->scopeUsersToEffectiveBranch($query, $branchId);

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
                $actor = $request->user();

                return array_merge($user->toArray(), [
                    'can_view' => $actor?->can('view', $user) ?? false,
                    'can_edit' => $actor?->can('update', $user) ?? false,
                    'can_delete' => $actor?->can('delete', $user) ?? false,
                    'can_view_linked_employee' => $user->employee
                        ? ($actor?->can('view', $user->employee) ?? false)
                        : false,
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

    public function create(Request $request): Response
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        return Inertia::render('Modules/Users/Pages/Create', [
            'roles' => $this->assignableRoleNames(),
            'statusOptions' => ['active', 'inactive'],
            'employeesForLink' => $this->branchScope->employeesAvailableForUserForm($request, null),
            'activeBranches' => $this->branchScope->branchesForUserAssignmentForms($actor, null),
            'suggestedBranchId' => $this->branchScope->suggestedDefaultBranchId($request, $actor, true),
        ]);
    }

    public function store(
        UserStoreRequest $request,
        SyncUserEmployeeLinkAction $linkEmployee,
        SyncUserBranchAssignmentsAction $syncBranches,
    ): RedirectResponse {
        $data = $request->validated();
        $rawEmployeeId = $data['employee_id'] ?? null;
        unset($data['employee_id']);
        $branchIds = array_values(array_unique(array_map('intval', $data['branch_ids'] ?? [])));
        unset($data['branch_ids']);
        $employeeId = $rawEmployeeId !== null ? (int) $rawEmployeeId : null;

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'],
            'branch_id' => $data['branch_id'],
        ]);

        $syncBranches->execute($user, $branchIds);

        $user->syncRoles($data['roles'] ?? []);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $linkEmployee->execute($user, $employeeId);

        $user->refresh();

        if ($this->branchScope->userRecordVisibleInBranchContext(
            $user,
            $this->branchScope->effectiveBranchId($request, $request->user()),
        )) {
            return redirect()->route('settings.users.show', $user)->with('success', 'User created.');
        }

        return redirect()->route('settings.users.index')->with(
            'success',
            'User created. They belong to another branch, so you were returned to the user list.',
        );
    }

    public function show(User $user): Response
    {
        $user->load([
            'roles',
            'branch:id,code,name',
            'assignedBranches:id,code,name,is_active',
            'employee:id,employee_code,display_name,user_id',
        ]);

        return Inertia::render('Modules/Users/Pages/Show', [
            'user' => $user,
            'canEdit' => request()->user()?->can('update', $user) ?? false,
            'canDelete' => request()->user()?->can('delete', $user) ?? false,
        ]);
    }

    public function edit(Request $request, User $user): Response
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $user->load([
            'roles',
            'branch:id,code,name',
            'assignedBranches:id,code,name,is_active',
            'employee:id,employee_code,display_name,user_id',
        ]);

        return Inertia::render('Modules/Users/Pages/Edit', [
            'user' => $user,
            'roles' => $this->assignableRoleNames(),
            'statusOptions' => ['active', 'inactive'],
            'employeesForLink' => $this->branchScope->employeesAvailableForUserForm($request, $user),
            'activeBranches' => $this->branchScope->branchesForUserAssignmentForms($actor, (int) $user->branch_id),
            'suggestedBranchId' => $this->branchScope->suggestedDefaultBranchId($request, $actor, true),
        ]);
    }

    public function update(
        UserUpdateRequest $request,
        User $user,
        SyncUserEmployeeLinkAction $linkEmployee,
        SyncUserBranchAssignmentsAction $syncBranches,
    ): RedirectResponse {
        $data = $request->validated();
        $rawEmployeeId = $data['employee_id'] ?? null;
        unset($data['employee_id']);
        $branchIds = array_values(array_unique(array_map('intval', $data['branch_ids'] ?? [])));
        unset($data['branch_ids']);
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

        $syncBranches->execute($user, $branchIds);

        $user->syncRoles($data['roles'] ?? []);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $linkEmployee->execute($user, $employeeId);

        $user->refresh();

        if ($this->branchScope->userRecordVisibleInBranchContext(
            $user,
            $this->branchScope->effectiveBranchId($request, $request->user()),
        )) {
            return redirect()->route('settings.users.show', $user)->with('success', 'User updated.');
        }

        return redirect()->route('settings.users.index')->with(
            'success',
            'User updated. They are assigned to another branch, so you were returned to the user list.',
        );
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('settings.users.index')->with('success', 'User deleted.');
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
}
