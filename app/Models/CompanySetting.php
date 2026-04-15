<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name',
        'registered_address',
        'company_email',
        'tin_number',
        'vat_number',
        'site_icon_path',
        'time_zone',
        'currency_code',
        'currency_symbol',
        'currency_format',
        'system_country',
        'created_by',
        'updated_by',
    ];

    public function phoneNumbers(): HasMany
    {
        return $this->hasMany(CompanyPhoneNumber::class)->orderBy('display_order')->orderBy('id');
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(CompanyBankAccount::class)->orderBy('display_order')->orderBy('id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Single-tenant row (id = 1). Seeded by migration; keeps schema ready for multi-company later.
     */
    public static function current(): self
    {
        return static::query()->orderBy('id')->firstOrFail();
    }
}
