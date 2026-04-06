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
        'given_names',
        'display_name',
        'email',
        'designation',
        'department',
        'nic',
        'gender',
        'marital_status',
        'status',
        'joined_date',
        'date_of_birth',
        'notes',
        'address_line_1',
        'address_line_2',
        'city',
        'country',
        'profile_photo_path',
        'bank_name',
        'bank_branch',
        'bank_account_number',
        'tin_number',
        'epf_number',
        'etf_number',
        'employment_type',
        'basic_salary',
        'is_overtime_eligible',
        'emergency_contact_person',
        'emergency_contact_phone',
        'user_id',
        'is_sales_commission_eligible',
        'branch_id',
    ];

    protected $casts = [
        'joined_date' => 'date',
        'date_of_birth' => 'date',
        'is_sales_commission_eligible' => 'boolean',
        'is_overtime_eligible' => 'boolean',
        'basic_salary' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
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
