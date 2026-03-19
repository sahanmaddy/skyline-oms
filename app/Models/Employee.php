<?php

namespace App\Models;

use App\Enums\EmployeeStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_code',
        'first_name',
        'last_name',
        'display_name',
        'email',
        'designation',
        'department',
        'nic',
        'status',
        'joined_date',
        'notes',
        'address_line_1',
        'address_line_2',
        'city',
        'country',
        'bank_name',
        'bank_branch',
        'bank_account_number',
        'user_id',
        'is_sales_commission_eligible',
    ];

    protected $casts = [
        'joined_date' => 'date',
        'is_sales_commission_eligible' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function phoneNumbers(): HasMany
    {
        return $this->hasMany(EmployeePhoneNumber::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', EmployeeStatus::Active->value);
    }
}
