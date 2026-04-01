<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $contextBranch = null;
        $branchesForContext = [];

        if ($user instanceof User) {
            $user->loadMissing(['branch:id,code,name,is_active']);

            $allowedIds = $this->allowedBranchIdsForUser($user);
            $branchId = (int) session('current_branch_id', $user->branch_id);

            if (! in_array($branchId, $allowedIds, true)) {
                $branchId = (int) $user->branch_id;
                session(['current_branch_id' => $branchId]);
            }

            $contextBranch = Branch::query()->whereKey($branchId)->first()
                ?? $user->branch;

            if ($contextBranch) {
                session(['current_branch_id' => (int) $contextBranch->id]);
            }

            $branchesForContext = Branch::query()
                ->active()
                ->when(! $user->can('branches.view'), fn ($q) => $q->whereKey($user->branch_id))
                ->orderBy('name')
                ->get(['id', 'code', 'name'])
                ->values()
                ->all();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'roles' => $user ? $user->getRoleNames()->values() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name')->values() : [],
                'context_branch' => $contextBranch ? [
                    'id' => $contextBranch->id,
                    'code' => $contextBranch->code,
                    'name' => $contextBranch->name,
                    'is_active' => $contextBranch->is_active,
                ] : null,
                'branches_for_context' => $branchesForContext,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }

    /**
     * @return list<int>
     */
    private function allowedBranchIdsForUser(User $user): array
    {
        $ids = [(int) $user->branch_id];

        if ($user->can('branches.view')) {
            $ids = array_merge(
                $ids,
                Branch::query()->active()->pluck('id')->map(fn ($id) => (int) $id)->all(),
            );
        }

        return array_values(array_unique($ids));
    }
}
