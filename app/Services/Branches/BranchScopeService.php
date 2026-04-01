<?php

namespace App\Services\Branches;

use App\Models\Branch;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class BranchScopeService
{
    /**
     * Branch IDs the user may use as session working context (navbar).
     *
     * @return list<int>
     */
    public function allowedSwitcherBranchIds(User $user): array
    {
        $own = [(int) $user->branch_id];

        if ($user->can('branches.view')) {
            $active = Branch::query()->active()->pluck('id')->map(fn ($id) => (int) $id)->all();

            return array_values(array_unique(array_merge($own, $active)));
        }

        return array_values(array_unique($own));
    }

    public function effectiveBranchId(Request $request, ?User $user = null): int
    {
        $user ??= $request->user();
        abort_unless($user instanceof User, 403);

        $allowed = $this->allowedSwitcherBranchIds($user);
        $fromSession = (int) $request->session()->get('current_branch_id', $user->branch_id);

        if (! in_array($fromSession, $allowed, true)) {
            $fromSession = (int) $user->branch_id;
            $request->session()->put('current_branch_id', $fromSession);
        }

        return $fromSession;
    }

    /**
     * Active branches shown in the navbar (subset of allowed switcher IDs).
     */
    public function branchesForNavbar(User $user): Collection
    {
        $ids = $this->allowedSwitcherBranchIds($user);

        return Branch::query()
            ->active()
            ->whereIn('id', $ids)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'is_active']);
    }

    public function resolveContextBranch(Request $request, User $user): ?Branch
    {
        $id = $this->effectiveBranchId($request, $user);

        return Branch::query()->whereKey($id)->first() ?? $user->branch;
    }

    /**
     * Branch rows for user/employee assignment dropdowns (create/edit).
     */
    public function branchesForAssignmentForms(User $actor, ?int $persistedBranchId = null): Collection
    {
        return Branch::query()
            ->where(function (Builder $w) use ($actor, $persistedBranchId) {
                if ($actor->can('branches.view')) {
                    $w->where('is_active', true);
                } else {
                    $w->whereKey($actor->branch_id);
                }

                if ($persistedBranchId !== null) {
                    $w->orWhereKey($persistedBranchId);
                }
            })
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'is_active']);
    }

    /**
     * @return list<int>
     */
    public function assignableBranchIdsForValidation(User $actor, ?int $persistedBranchId = null): array
    {
        return $this->branchesForAssignmentForms($actor, $persistedBranchId)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    public function scopeEmployeesToEffectiveBranch(Builder $query, int $branchId): Builder
    {
        return $query->where($query->getModel()->getTable().'.branch_id', $branchId);
    }

    public function scopeUsersToEffectiveBranch(Builder $query, int $branchId): Builder
    {
        return $query->where($query->getModel()->getTable().'.branch_id', $branchId);
    }

    /**
     * Record must belong to the current working branch context.
     */
    public function recordMatchesEffectiveBranch(Request $request, ?int $recordBranchId, ?User $actor = null): bool
    {
        $actor ??= $request->user();
        if (! $actor instanceof User || $recordBranchId === null) {
            return false;
        }

        return (int) $recordBranchId === $this->effectiveBranchId($request, $actor);
    }

    /**
     * Unlinked users (plus current link on edit) within assignable branches; includes branch_id for UI filtering.
     *
     * @return Collection<int, User>
     */
    public function usersAvailableForEmployeeForm(Request $request, ?Employee $employee = null): Collection
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $assignable = $this->assignableBranchIdsForValidation($actor, $employee?->branch_id);

        $coll = User::query()
            ->whereDoesntHave('employee')
            ->whereIn('branch_id', $assignable)
            ->select(['id', 'name', 'email', 'branch_id'])
            ->orderBy('name')
            ->get();

        if ($employee?->user_id) {
            $current = User::query()
                ->select(['id', 'name', 'email', 'branch_id'])
                ->find($employee->user_id);
            if ($current) {
                $coll = $coll->prepend($current)->unique('id')->values();
            }
        }

        return $coll;
    }

    /**
     * Employees that may be linked to a user; includes branch_id for UI filtering.
     *
     * @return Collection<int, Employee>
     */
    public function employeesAvailableForUserForm(Request $request, ?User $editingUser = null): Collection
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $assignable = $this->assignableBranchIdsForValidation($actor, $editingUser?->branch_id);

        return Employee::query()
            ->select(['id', 'employee_code', 'display_name', 'branch_id'])
            ->where(function (Builder $q) use ($editingUser) {
                $q->whereNull('user_id');
                if ($editingUser) {
                    $q->orWhere('user_id', $editingUser->id);
                }
            })
            ->whereIn('branch_id', $assignable)
            ->orderBy('display_name')
            ->get();
    }

    /**
     * Suggested default branch_id for new user/employee forms (prefill).
     */
    public function suggestedDefaultBranchId(Request $request, User $actor): int
    {
        $effective = $this->effectiveBranchId($request, $actor);
        $allowed = $this->assignableBranchIdsForValidation($actor, null);

        if (in_array($effective, $allowed, true)) {
            return $effective;
        }

        return (int) ($allowed[0] ?? $actor->branch_id);
    }
}
