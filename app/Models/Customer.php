<?php

namespace App\Models;

use App\Enums\CustomerStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    /** System walk-in / cash sales customer (not editable via Customers module). */
    public const CASH_CUSTOMER_CODE = 'C-0';

    public const CASH_CUSTOMER_DISPLAY_NAME = 'Cash Customer';

    public const CASH_CUSTOMER_NAME = 'Walk-in Customer';

    protected $fillable = [
        'customer_code',
        'display_name',
        'customer_name',
        'company_name',
        'nic',
        'vat_number',
        'tin_number',
        'email',
        'status',
        'address_line_1',
        'address_line_2',
        'city',
        'state_province',
        'postal_code',
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

    public function isSystemCashCustomer(): bool
    {
        return $this->customer_code === self::CASH_CUSTOMER_CODE;
    }
}
