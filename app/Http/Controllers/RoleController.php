<?php

namespace App\Http\Controllers;

use App\Actions\Roles\DeleteRoleAction;
use App\Http\Requests\RoleStoreRequest;
use App\Http\Requests\RoleUpdateRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Role::class, 'role');
    }

    public function index(Request $request): Response
    {
        $query = Role::query()
            ->withCount(['permissions', 'users']);
        $hasDescription = Schema::hasColumn('roles', 'description');
        $hasIsActive = Schema::hasColumn('roles', 'is_active');

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search, $hasDescription) {
                $q->where('name', 'like', "%{$search}%");

                if ($hasDescription) {
                    $q->orWhere('description', 'like', "%{$search}%");
                }
            });
        }

        if ($hasIsActive && ($status = $request->string('status')->toString())) {
            if (in_array($status, ['active', 'inactive'], true)) {
                $query->where('is_active', $status === 'active');
            }
        }

        $deleteRole = app(DeleteRoleAction::class);

        $roles = $query->orderBy('name')->paginate(15)->withQueryString()->through(
            function (Role $role) use ($request, $deleteRole) {
                $mayDelete = $request->user()?->can('delete', $role) ?? false;

                return array_merge($role->toArray(), [
                    'can_view' => $request->user()?->can('view', $role) ?? false,
                    'can_edit' => $request->user()?->can('update', $role) ?? false,
                    'can_delete' => $mayDelete && $deleteRole->isDeletable($role),
                ]);
            }
        );

        return Inertia::render('Modules/RolesPermissions/Roles/Pages/Index', [
            'roles' => $roles,
            'canCreate' => $request->user()?->can('create', Role::class) ?? false,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => ['active', 'inactive'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/RolesPermissions/Roles/Pages/Create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function store(RoleStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $payload = [
            'name' => $validated['name'],
            'guard_name' => 'web',
        ];

        if (Schema::hasColumn('roles', 'description')) {
            $payload['description'] = $validated['description'] ?? null;
        }
        if (Schema::hasColumn('roles', 'is_active')) {
            $payload['is_active'] = (bool) ($validated['is_active'] ?? true);
        }
        if (Schema::hasColumn('roles', 'is_system')) {
            $payload['is_system'] = false;
        }

        $role = Role::create($payload);

        $role->syncPermissions($validated['permission_ids'] ?? []);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()->route('settings.roles.show', $role)->with('success', 'Role created.');
    }

    public function show(Role $role): Response
    {
        $role->load([
            'permissions' => fn ($q) => $q->orderBy('module')->orderBy('name'),
            'users:id,name,email,status',
        ]);

        $deleteRole = app(DeleteRoleAction::class);
        $mayDelete = request()->user()?->can('delete', $role) ?? false;

        $assignedUsers = $role->users->map(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'can_view' => request()->user()?->can('view', $user) ?? false,
            ];
        })->values()->all();

        return Inertia::render('Modules/RolesPermissions/Roles/Pages/Show', [
            'role' => $role,
            'assignedUsers' => $assignedUsers,
            'canEdit' => request()->user()?->can('update', $role) ?? false,
            'canDelete' => $mayDelete && $deleteRole->isDeletable($role),
            'permissionsGrouped' => $role->permissions
                ->groupBy(fn (Permission $permission) => $permission->module ?: 'General')
                ->map(fn ($items) => $items->values())
                ->sortKeys()
                ->toArray(),
        ]);
    }

    public function edit(Role $role): Response
    {
        $role->load('permissions:id,name');

        return Inertia::render('Modules/RolesPermissions/Roles/Pages/Edit', [
            'role' => $role,
            'permissionGroups' => $this->permissionGroups(),
            'assignedPermissionIds' => $role->permissions->pluck('id')->values(),
        ]);
    }

    public function update(RoleUpdateRequest $request, Role $role): RedirectResponse
    {
        $validated = $request->validated();

        $payload = [
            'name' => $validated['name'],
        ];
        if (Schema::hasColumn('roles', 'description')) {
            $payload['description'] = $validated['description'] ?? null;
        }
        if (Schema::hasColumn('roles', 'is_active')) {
            $payload['is_active'] = (bool) ($validated['is_active'] ?? true);
        }
        $role->update($payload);

        $role->syncPermissions($validated['permission_ids'] ?? []);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()->route('settings.roles.show', $role)->with('success', 'Role updated.');
    }

    public function destroy(Role $role, DeleteRoleAction $deleteRole): RedirectResponse
    {
        try {
            $deleteRole->execute($role);
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('settings.roles.index')->with('success', 'Role deleted.');
    }

    private function permissionGroups(): array
    {
        $hasDisplayName = Schema::hasColumn('permissions', 'display_name');
        $hasModule = Schema::hasColumn('permissions', 'module');

        $selects = ['id', 'name'];
        if ($hasDisplayName) {
            $selects[] = 'display_name';
        }
        if ($hasModule) {
            $selects[] = 'module';
        }

        $query = Permission::query();
        if ($hasModule) {
            $query->orderBy('module');
        }

        return $query
            ->orderBy('name')
            ->get($selects)
            ->groupBy(function (Permission $permission) use ($hasModule) {
                if ($hasModule) {
                    return $permission->module ?: 'General';
                }

                $parts = explode('.', $permission->name, 2);

                return ucfirst($parts[0] ?? 'General');
            })
            ->map(fn ($items) => $items->values())
            ->sortKeys()
            ->toArray();
    }
}
