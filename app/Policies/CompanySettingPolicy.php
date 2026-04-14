<?php

namespace App\Policies;

use App\Models\CompanySetting;
use App\Models\User;

class CompanySettingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('settings.company.view');
    }

    public function view(User $user, CompanySetting $companySetting): bool
    {
        return $user->can('settings.company.view');
    }

    public function update(User $user, CompanySetting $companySetting): bool
    {
        return $user->can('settings.company.edit');
    }
}
