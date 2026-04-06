<?php

namespace App\Http\Controllers;

use App\Services\Branches\BranchScopeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchContextController extends Controller
{
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

        return back()->with('success', 'Working branch updated.');
    }
}
