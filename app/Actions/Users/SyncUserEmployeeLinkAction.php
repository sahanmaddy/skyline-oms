<?php

namespace App\Actions\Users;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SyncUserEmployeeLinkAction
{
    /**
     * Link at most one employee to this user by setting employees.user_id.
     * Clears the link on employees that previously pointed to this user.
     */
    public function execute(User $user, ?int $employeeId): void
    {
        DB::transaction(function () use ($user, $employeeId) {
            Employee::query()
                ->where('user_id', $user->id)
                ->update(['user_id' => null]);

            if ($employeeId === null) {
                return;
            }

            Employee::query()
                ->whereKey($employeeId)
                ->update(['user_id' => $user->id]);
        });
    }
}
