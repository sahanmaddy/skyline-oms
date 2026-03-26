<?php

namespace App\Models;

use App\Enums\CustomerStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_code',
        'customer_name',
        'company_name',
        'contact_person',
        'nic',
        'vat_tax_number',
        'email',
        'status',
        'address_line_1',
        'address_line_2',
        'city',
        'district',
        'country',
        'credit_eligible',
        'credit_limit',
        'guarantor',
        'notes',
    ];

    protected $casts = [
        'credit_eligible' => 'boolean',
        'credit_limit' => 'decimal:2',
    ];

    public function phoneNumbers(): HasMany
    {
        return $this->hasMany(CustomerPhoneNumber::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CustomerDocument::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', CustomerStatus::Active->value);
    }
}

