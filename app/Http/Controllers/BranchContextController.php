<?php

namespace App\Http\Controllers;

use App\Services\Branches\BranchScopeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchContextController extends Controller
{
    /**
     * Resolve a safe post-switch destination based on where the user switched from.
     */
    private function resolvePostSwitchRoute(Request $request, string $previousPath): string
    {
        $user = $request->user();
        if (! $user) {
            return 'dashboard';
        }

        if (str_starts_with($previousPath, '/hr') && $user->can('employees.view')) {
            return 'hr.employees.index';
        }

        if (str_starts_with($previousPath, '/sales') && $user->can('customers.view')) {
            return 'sales.customers.index';
        }

        if (str_starts_with($previousPath, '/settings')) {
            return 'settings.profile.edit';
        }

        return 'dashboard';
    }

    /**
     * List/index pages that remain safe across branch-context switches.
     */
    private function shouldReturnBack(string $previousPath): bool
    {
        return in_array($previousPath, [
            '/dashboard',
            '/hr',
            '/hr/employees',
            '/sales',
            '/sales/customers',
            '/settings',
            '/settings/profile',
            '/settings/users',
            '/settings/roles',
            '/settings/permissions',
            '/settings/branches',
            '/settings/company',
            '/settings/system',
        ], true);
    }

    /**
     * Session-based working branch for authorized users.
     */
    public function update(Request $request, BranchScopeService $scope): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user, 403);

        $request->validate([
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('branches', 'id')->where('is_active', true),
            ],
        ]);

        $branchId = (int) $request->input('branch_id');

        abort_unless(
            in_array($branchId, $scope->allowedSwitcherBranchIds($user), true),
            403,
        );

        $request->session()->put('current_branch_id', $branchId);

        $previousPath = parse_url(url()->previous(), PHP_URL_PATH) ?: '';

        if ($this->shouldReturnBack($previousPath)) {
            return back()->with('success', 'Working branch updated.');
        }

        // For detail/edit pages, redirect to a safe module landing page to avoid post-switch 403s.
        return redirect()->route($this->resolvePostSwitchRoute($request, $previousPath))
            ->with('success', 'Working branch updated.');
    }
}
