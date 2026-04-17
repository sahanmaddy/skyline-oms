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
        'shipment_currency_basis_notes',
        'exchange_rate',
        'exchange_rate_currency_label',
        'container_cbm_capacity',
        'shipping_cost_total_lkr',
        'loading_cost_lkr',
        'unloading_cost_lkr',
        'transport_cost_lkr',
        'delivery_order_charges_lkr',
        'clearing_charges_lkr',
        'demurrage_cost_lkr',
        'other_costs_lkr_total',
        'notes',
        'calculation_status',
        'totals',
        'item_count',
        'total_product_value_lkr',
        'total_statistical_value_lkr',
        'total_cid_lkr',
        'total_vat_lkr',
        'total_sscl_lkr',
        'total_duty_lkr',
        'total_allocated_shipping_lkr',
        'total_allocated_other_costs_lkr',
        'grand_total_landed_cost_lkr',
        'total_weight_kg',
        'total_cbm',
        'shipping_cost_per_cbm_lkr',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'container_cbm_capacity' => 'decimal:4',
        'shipping_cost_total_lkr' => 'decimal:2',
        'loading_cost_lkr' => 'decimal:2',
        'unloading_cost_lkr' => 'decimal:2',
        'transport_cost_lkr' => 'decimal:2',
        'delivery_order_charges_lkr' => 'decimal:2',
        'clearing_charges_lkr' => 'decimal:2',
        'demurrage_cost_lkr' => 'decimal:2',
        'other_costs_lkr_total' => 'decimal:2',
        'item_count' => 'integer',
        'total_product_value_lkr' => 'decimal:2',
        'total_statistical_value_lkr' => 'decimal:2',
        'total_cid_lkr' => 'decimal:2',
        'total_vat_lkr' => 'decimal:2',
        'total_sscl_lkr' => 'decimal:2',
        'total_duty_lkr' => 'decimal:2',
        'total_allocated_shipping_lkr' => 'decimal:2',
        'total_allocated_other_costs_lkr' => 'decimal:2',
        'grand_total_landed_cost_lkr' => 'decimal:2',
        'total_weight_kg' => 'decimal:3',
        'total_cbm' => 'decimal:4',
        'shipping_cost_per_cbm_lkr' => 'decimal:2',
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

