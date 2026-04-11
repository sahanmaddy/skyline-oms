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
     * Always derived from {@see User::assignedBranches} (active only). Role/permission does not
     * widen the switcher; admins assign themselves extra branches on their user record if needed.
     *
     * @return list<int>
     */
    public function allowedSwitcherBranchIds(User $user): array
    {
        $user->loadMissing('assignedBranches:id,is_active');

        $fromPivot = $user->assignedBranches
            ->filter(fn (Branch $b) => $b->is_active)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        if ($fromPivot !== []) {
            return array_values(array_unique($fromPivot));
        }

        $fallback = (int) $user->branch_id;

        return $fallback ? [$fallback] : [];
    }

    /**
     * After a branch row is removed, ensure session working context is not a stale ID.
     *
     * Call after the delete transaction commits; refresh the user so pivot cascades are visible.
     */
    public function clearSessionIfPointingAtRemovedBranch(Request $request, User $user, int $removedBranchId): void
    {
        $sessionId = (int) $request->session()->get('current_branch_id', 0);
        if ($sessionId !== $removedBranchId) {
            return;
        }

        $allowed = $this->allowedSwitcherBranchIds($user);
        $allowed = array_values(array_filter($allowed, fn (int $id) => $id !== $removedBranchId));

        $fallback = (int) $user->branch_id;
        if ($fallback > 0 && $fallback !== $removedBranchId && in_array($fallback, $allowed, true)) {
            $request->session()->put('current_branch_id', $fallback);

            return;
        }

        if ($allowed !== []) {
            $request->session()->put('current_branch_id', (int) $allowed[0]);

            return;
        }

        $request->session()->forget('current_branch_id');
    }

    public function effectiveBranchId(Request $request, ?User $user = null): int
    {
        $user ??= $request->user();
        abort_unless($user instanceof User, 403);

        $allowed = $this->allowedSwitcherBranchIds($user);
        $fromSession = (int) $request->session()->get('current_branch_id', $user->branch_id);

        if (! in_array($fromSession, $allowed, true)) {
            $fromSession = (int) $user->branch_id;
            if (! in_array($fromSession, $allowed, true) && $allowed !== []) {
                $fromSession = (int) $allowed[0];
            }
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
     * Branch rows for **employee** work-branch and other assignments tied to the actor's working scope.
     *
     * Same as the navbar: {@see allowedSwitcherBranchIds} only. Managers cannot place employees in
     * branches they do not have access to.
     */
    public function branchesForAssignmentForms(User $actor, ?int $persistedBranchId = null): Collection
    {
        $ids = $this->allowedSwitcherBranchIds($actor);

        if ($persistedBranchId !== null) {
            $pid = (int) $persistedBranchId;
            if (! in_array($pid, $ids, true)) {
                $ids[] = $pid;
            }
        }

        $ids = array_values(array_unique($ids));

        if ($ids === []) {
            return collect();
        }

        return Branch::query()
            ->whereIn('id', $ids)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'is_active']);
    }

    /**
     * Branches for **user** create/edit: default branch + branch access (pivot).
     *
     * Users with `branches.view` (see {@see PermissionCatalog}) see every active branch so they can
     * grant access org-wide. Others only see branches they themselves are assigned to (navbar scope).
     */
    public function branchesForUserAssignmentForms(User $actor, ?int $persistedBranchId = null): Collection
    {
        if ($actor->can('branches.view')) {
            return Branch::query()
                ->where(function (Builder $w) use ($persistedBranchId) {
                    $w->where('is_active', true);
                    if ($persistedBranchId !== null) {
                        $w->orWhere('id', (int) $persistedBranchId);
                    }
                })
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'is_active']);
        }

        return $this->branchesForAssignmentForms($actor, $persistedBranchId);
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

    /**
     * Allowed branch IDs when validating user {@code branch_id} / {@code branch_ids}.
     *
     * @return list<int>
     */
    public function assignableBranchIdsForUserFormValidation(User $actor, ?int $persistedBranchId = null): array
    {
        return $this->branchesForUserAssignmentForms($actor, $persistedBranchId)
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
        $table = $query->getModel()->getTable();

        return $query->where(function (Builder $q) use ($branchId, $table) {
            $q->where($table.'.branch_id', $branchId)
                ->orWhereHas('assignedBranches', fn (Builder $b) => $b->where('branches.id', $branchId));
        });
    }

    /**
     * Whether this user record is visible in the given working-branch context (default or assigned access).
     */
    public function userRecordVisibleInBranchContext(User $model, int $effectiveBranchId): bool
    {
        if ((int) $model->branch_id === $effectiveBranchId) {
            return true;
        }

        $model->loadMissing('assignedBranches:id,is_active');

        return $model->assignedBranches
            ->filter(fn (Branch $b) => $b->is_active)
            ->contains('id', $effectiveBranchId);
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
            ->where(function (Builder $q) use ($assignable) {
                $q->whereIn('branch_id', $assignable)
                    ->orWhereHas(
                        'assignedBranches',
                        fn (Builder $b) => $b->whereIn('branches.id', $assignable),
                    );
            })
            ->with('assignedBranches:id,is_active')
            ->select(['id', 'name', 'email', 'branch_id'])
            ->orderBy('name')
            ->get();

        if ($employee?->user_id) {
            $current = User::query()
                ->with('assignedBranches:id,is_active')
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

        // Match UserStoreRequest / UserUpdateRequest and branchesForUserAssignmentForms so editors
        // who may assign org-wide branches still see linkable employees in those branches.
        $assignable = $this->assignableBranchIdsForUserFormValidation($actor, $editingUser?->branch_id);

        if ($assignable === []) {
            return collect();
        }

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
            ->get()
            ->values();
    }

    /**
     * Suggested default branch_id for new user/employee forms (prefill).
     *
     * @param  bool  $forUserRecord  When true, uses {@see assignableBranchIdsForUserFormValidation} (wider list if `branches.view`).
     */
    public function suggestedDefaultBranchId(Request $request, User $actor, bool $forUserRecord = false): int
    {
        $effective = $this->effectiveBranchId($request, $actor);
        $allowed = $forUserRecord
            ? $this->assignableBranchIdsForUserFormValidation($actor, null)
            : $this->assignableBranchIdsForValidation($actor, null);

        if (in_array($effective, $allowed, true)) {
            return $effective;
        }

        return (int) ($allowed[0] ?? $actor->branch_id);
    }
}
