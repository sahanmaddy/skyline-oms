<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        $query = User::query()->with(['roles', 'employee']);

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
            'roles' => Role::query()->orderBy('name')->pluck('name')->all(),
            'statusOptions' => ['active', 'inactive'],
        ]);
    }

    public function store(UserStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => $data['status'],
        ]);

        $user->syncRoles([$data['role']]);

        return redirect()->route('users.show', $user)->with('success', 'User created.');
    }

    public function show(User $user): Response
    {
        $user->load(['roles', 'employee']);

        return Inertia::render('Modules/Users/Pages/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load(['roles', 'employee']);

        return Inertia::render('Modules/Users/Pages/Edit', [
            'user' => $user,
            'roles' => Role::query()->orderBy('name')->pluck('name')->all(),
            'statusOptions' => ['active', 'inactive'],
        ]);
    }

    public function update(UserUpdateRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'status' => $data['status'],
        ]);

        if (! empty($data['password'])) {
            $user->update(['password' => Hash::make($data['password'])]);
        }

        $user->syncRoles([$data['role']]);

        return redirect()->route('users.show', $user)->with('success', 'User updated.');
    }
}
