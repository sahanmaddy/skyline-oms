<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Branches\BranchScopeService;
use App\Services\Organization\CompanySettingsPresenter;
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
        $scope = app(BranchScopeService::class);

        $contextBranch = null;
        $branchesForContext = [];

        if ($user instanceof User) {
            $user->loadMissing([
                'branch:id,code,name,is_active',
                'assignedBranches:id,code,name,is_active',
            ]);

            $contextBranchModel = $scope->resolveContextBranch($request, $user);
            if ($contextBranchModel) {
                $request->session()->put('current_branch_id', (int) $contextBranchModel->id);
            }

            $contextBranch = $contextBranchModel ? [
                'id' => $contextBranchModel->id,
                'code' => $contextBranchModel->code,
                'name' => $contextBranchModel->name,
                'is_active' => $contextBranchModel->is_active,
            ] : null;

            $branchesForContext = $scope->branchesForNavbar($user)
                ->map(fn ($b) => [
                    'id' => $b->id,
                    'code' => $b->code,
                    'name' => $b->name,
                ])
                ->values()
                ->all();
        }

        return [
            ...parent::share($request),
            'app_display_name' => fn () => app(CompanySettingsPresenter::class)->shared()['name']
                ?? config('app.name', 'Skyline OMS'),
            'company' => fn () => app(CompanySettingsPresenter::class)->shared(),
            'auth' => [
                'user' => $user,
                'roles' => $user ? $user->getRoleNames()->values() : [],
                'permissions' => $user ? $user->getAllPermissions()->pluck('name')->values() : [],
                'context_branch' => $contextBranch,
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
}
