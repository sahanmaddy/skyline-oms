<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'guard_name',
        'description',
        'is_active',
        'is_system',
    ];

    protected $casts = [
        'is_active' => 'bool',
        'is_system' => 'bool',
    ];
}
