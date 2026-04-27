<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'supplier_code',
        'company_name',
        'display_name',
        'contact_person',
        'email',
        'website',
        'primary_phone_country_code',
        'primary_phone_number',
        'whatsapp_country_code',
        'whatsapp_number',
        'address_line_1',
        'address_line_2',
        'city',
        'state_province',
        'postal_code',
        'country',
        'tax_number',
        'vat_number',
        'notes',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function calculations(): HasMany
    {
        return $this->hasMany(DutyCostCalculation::class);
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(SupplierBankAccount::class)->orderBy('display_order')->orderBy('id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
