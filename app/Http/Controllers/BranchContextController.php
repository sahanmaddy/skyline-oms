<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchContextController extends Controller
{
    /**
     * Session-based working branch for users who may switch context (e.g. branches.view).
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user, 403);

        $validated = $request->validate([
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('branches', 'id')->where('is_active', true),
            ],
        ]);

        $branchId = (int) $validated['branch_id'];

        if (! $user->can('branches.view')) {
            if ($branchId !== (int) $user->branch_id) {
                abort(403);
            }
        }

        session(['current_branch_id' => $branchId]);

        return back();
    }
}
