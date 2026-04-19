<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DutyCostCalculation extends Model
{
    protected $fillable = [
        'calculation_code',
        'title',
        'reference_no',
        'supplier_name',
        'purchasing_currency',
        'local_currency',
        'shipment_currency_basis_notes',
        'exchange_rate',
        'freight_currency',
        'freight_exchange_rate',
        'total_shipment_cbm',
        'freight_cost_total',
        'loading_unloading_cost_lkr',
        'transport_cost_lkr',
        'delivery_order_charges_lkr',
        'clearing_charges_lkr',
        'demurrage_cost_lkr',
        'additional_entry_cost_lkr',
        'cid_rate_per_kg_lkr',
        'duty_base_percent',
        'vat_rate_percent',
        'sscl_rate_percent',
        'bank_interest_rate_pa',
        'bank_interest_months',
        'other_costs_lkr_total',
        'notes',
        'calculation_status',
        'totals',
        'item_count',
        'total_product_value_lkr',
        'total_statistical_value_lkr',
        'total_customs_base_lkr',
        'total_cid_lkr',
        'total_vat_lkr',
        'total_sscl_lkr',
        'total_duty_lkr',
        'total_allocated_freight_lkr',
        'total_allocated_other_costs_lkr',
        'total_bank_charges_lkr',
        'grand_total_landed_cost_lkr',
        'total_weight_kg',
        'total_cbm',
        'freight_cost_per_cbm_lkr',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'freight_exchange_rate' => 'decimal:4',
        'total_shipment_cbm' => 'decimal:2',
        'freight_cost_total' => 'decimal:2',
        'loading_unloading_cost_lkr' => 'decimal:2',
        'transport_cost_lkr' => 'decimal:2',
        'delivery_order_charges_lkr' => 'decimal:2',
        'clearing_charges_lkr' => 'decimal:2',
        'demurrage_cost_lkr' => 'decimal:2',
        'additional_entry_cost_lkr' => 'decimal:2',
        'cid_rate_per_kg_lkr' => 'decimal:2',
        'duty_base_percent' => 'decimal:2',
        'vat_rate_percent' => 'decimal:2',
        'sscl_rate_percent' => 'decimal:2',
        'bank_interest_rate_pa' => 'decimal:4',
        'bank_interest_months' => 'decimal:2',
        'other_costs_lkr_total' => 'decimal:2',
        'item_count' => 'integer',
        'total_product_value_lkr' => 'decimal:2',
        'total_statistical_value_lkr' => 'decimal:2',
        'total_customs_base_lkr' => 'decimal:2',
        'total_cid_lkr' => 'decimal:2',
        'total_vat_lkr' => 'decimal:2',
        'total_sscl_lkr' => 'decimal:2',
        'total_duty_lkr' => 'decimal:2',
        'total_allocated_freight_lkr' => 'decimal:2',
        'total_allocated_other_costs_lkr' => 'decimal:2',
        'total_bank_charges_lkr' => 'decimal:2',
        'grand_total_landed_cost_lkr' => 'decimal:2',
        'total_weight_kg' => 'decimal:3',
        'total_cbm' => 'decimal:4',
        'freight_cost_per_cbm_lkr' => 'decimal:2',
        'totals' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(DutyCostCalculationItem::class)->orderBy('line_no');
    }

    public function otherCosts(): HasMany
    {
        return $this->hasMany(DutyCostCalculationOtherCost::class)->orderBy('sort_order');
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
