<?php

namespace App\Http\Controllers;

use App\Actions\Permissions\DeletePermissionAction;
use App\Http\Requests\PermissionStoreRequest;
use App\Http\Requests\PermissionUpdateRequest;
use App\Models\Permission;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Permission::class, 'permission');
    }

    public function index(Request $request): Response
    {
        $query = Permission::query()->withCount('roles');
        $hasDisplayName = Schema::hasColumn('permissions', 'display_name');
        $hasDescription = Schema::hasColumn('permissions', 'description');
        $hasModule = Schema::hasColumn('permissions', 'module');

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search, $hasDisplayName, $hasDescription) {
                $q->where('name', 'like', "%{$search}%");

                if ($hasDisplayName) {
                    $q->orWhere('display_name', 'like', "%{$search}%");
                }

                if ($hasDescription) {
                    $q->orWhere('description', 'like', "%{$search}%");
                }
            });
        }

        if ($hasModule && ($module = trim((string) $request->string('module')))) {
            $query->where('module', $module);
        }

        if ($hasModule) {
            $query->orderBy('module');
        }

        $moduleOptions = $hasModule
            ? Permission::query()->select('module')->distinct()->orderBy('module')->pluck('module')
            : collect();

        $deletePermission = app(DeletePermissionAction::class);

        $permissions = $query->orderBy('name')->paginate(20)->withQueryString()->through(
            function (Permission $permission) use ($request, $deletePermission) {
                $mayDelete = $request->user()?->can('delete', $permission) ?? false;

                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'module' => $permission->module,
                    'description' => $permission->description,
                    'is_system' => $permission->is_system,
                    'roles_count' => $permission->roles_count,
                    'can_view' => $request->user()?->can('view', $permission) ?? false,
                    'can_edit' => $request->user()?->can('update', $permission) ?? false,
                    'can_delete' => $mayDelete && $deletePermission->isDeletable($permission),
                ];
            }
        );

        return Inertia::render('Modules/RolesPermissions/Permissions/Pages/Index', [
            'permissions' => $permissions,
            'canCreate' => $request->user()?->can('create', Permission::class) ?? false,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'module' => $request->string('module')->toString(),
            ],
            'moduleOptions' => $moduleOptions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/RolesPermissions/Permissions/Pages/Create');
    }

    public function store(PermissionStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $payload = [
            'name' => $validated['name'],
            'guard_name' => 'web',
        ];

        if (Schema::hasColumn('permissions', 'display_name')) {
            $payload['display_name'] = $validated['display_name'] ?? null;
        }
        if (Schema::hasColumn('permissions', 'module')) {
            $payload['module'] = $validated['module'] ?? 'General';
        }
        if (Schema::hasColumn('permissions', 'description')) {
            $payload['description'] = $validated['description'] ?? null;
        }
        if (Schema::hasColumn('permissions', 'is_system')) {
            $payload['is_system'] = false;
        }

        $permission = Permission::create($payload);

        return redirect()->route('settings.permissions.show', $permission)->with('success', 'Permission created.');
    }

    public function show(Permission $permission): Response
    {
        $permission->load('roles:id,name');
        $deletePermission = app(DeletePermissionAction::class);
        $mayDelete = request()->user()?->can('delete', $permission) ?? false;

        return Inertia::render('Modules/RolesPermissions/Permissions/Pages/Show', [
            'permission' => $permission,
            'canEdit' => request()->user()?->can('update', $permission) ?? false,
            'canDelete' => $mayDelete && $deletePermission->isDeletable($permission),
        ]);
    }

    public function edit(Permission $permission): Response
    {
        return Inertia::render('Modules/RolesPermissions/Permissions/Pages/Edit', [
            'permission' => $permission,
        ]);
    }

    public function update(PermissionUpdateRequest $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validated();
        $payload = [
            'name' => $validated['name'],
        ];

        if (Schema::hasColumn('permissions', 'display_name')) {
            $payload['display_name'] = $validated['display_name'] ?? null;
        }
        if (Schema::hasColumn('permissions', 'module')) {
            $payload['module'] = $validated['module'] ?? 'General';
        }
        if (Schema::hasColumn('permissions', 'description')) {
            $payload['description'] = $validated['description'] ?? null;
        }

        $permission->update($payload);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()->route('settings.permissions.show', $permission)->with('success', 'Permission updated.');
    }

    public function destroy(Permission $permission, DeletePermissionAction $deletePermission): RedirectResponse
    {
        try {
            $deletePermission->execute($permission);
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()->route('settings.permissions.index')->with('success', 'Permission deleted.');
    }
}
