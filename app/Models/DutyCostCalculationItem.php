<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Product line on a duty & cost calculation (stored with per-line allocations).
 *
 * Display names for calculated amounts (Show table / Product Summary) match the
 * Shipment Summary wording: Total Product Value, Total Statistical Value, Total CID,
 * Total VAT, Total SSCL, Total Allocated Freight, bank lines, then Total Allocated Other Costs
 * (with Total Duty, Remittance, Grand Total), Landed Cost Per Unit; foreign
 * line total uses “Total Product Value (Foreign)”; customs intermediate uses “Customs Base Value (%)”.
 */
class DutyCostCalculationItem extends Model
{
    protected $fillable = [
        'duty_cost_calculation_id',
        'line_no',
        'product_name',
        'product_code',
        'description',
        'product_currency',
        'unit_of_measure',
        'quantity',
        'unit_price_foreign',
        'total_product_value_foreign',
        'cbm',
        'weight_kg',
        'customs_preset_value_foreign_or_base',
        'cid_rate_per_kg_lkr',
        'eid_rate_per_kg_lkr',
        'statistical_value_lkr',
        'customs_base_110_lkr',
        'cid_lkr',
        'eid_lkr',
        'vat_lkr',
        'sscl_lkr',
        'duty_total_lkr',
        'product_value_lkr',
        'allocated_freight_lkr',
        'allocated_other_costs_lkr',
        'allocated_bank_charges_lkr',
        'total_landed_cost_lkr',
        'landed_cost_per_unit_lkr',
        'landed_cost_per_kg_lkr',
        'landed_cost_per_meter_lkr',
        'landed_cost_per_yard_lkr',
        'landed_cost_per_piece_lkr',
        'landed_cost_per_set_lkr',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price_foreign' => 'decimal:4',
        'total_product_value_foreign' => 'decimal:4',
        'cbm' => 'decimal:4',
        'weight_kg' => 'decimal:4',
        'customs_preset_value_foreign_or_base' => 'decimal:4',
        'cid_rate_per_kg_lkr' => 'decimal:2',
        'eid_rate_per_kg_lkr' => 'decimal:2',
        'statistical_value_lkr' => 'decimal:2',
        'customs_base_110_lkr' => 'decimal:2',
        'cid_lkr' => 'decimal:2',
        'eid_lkr' => 'decimal:2',
        'vat_lkr' => 'decimal:2',
        'sscl_lkr' => 'decimal:2',
        'duty_total_lkr' => 'decimal:2',
        'product_value_lkr' => 'decimal:2',
        'allocated_freight_lkr' => 'decimal:2',
        'allocated_other_costs_lkr' => 'decimal:2',
        'allocated_bank_charges_lkr' => 'decimal:2',
        'total_landed_cost_lkr' => 'decimal:2',
        'landed_cost_per_unit_lkr' => 'decimal:2',
        'landed_cost_per_kg_lkr' => 'decimal:2',
        'landed_cost_per_meter_lkr' => 'decimal:2',
        'landed_cost_per_yard_lkr' => 'decimal:2',
        'landed_cost_per_piece_lkr' => 'decimal:2',
        'landed_cost_per_set_lkr' => 'decimal:2',
    ];

    public function calculation(): BelongsTo
    {
        return $this->belongsTo(DutyCostCalculation::class, 'duty_cost_calculation_id');
    }
}
