<?php

namespace Database\Seeders;

use App\Models\DutyCostCalculation;
use App\Models\User;
use App\Services\Procurement\DutyCostCalculationService;
use Illuminate\Database\Seeder;

class DutyCostCalculationSampleSeeder extends Seeder
{
    public function run(): void
    {
        $userId = User::query()->value('id');
        if (! $userId) {
            return;
        }

        if (DutyCostCalculation::query()->exists()) {
            return;
        }

        $payload = [
            'title' => 'Sample Import Estimate - Textile Mix',
            'supplier_name' => 'Ningbo Textile Co.',
            'purchasing_currency' => 'USD',
            'local_currency' => 'LKR',
            'exchange_rate' => 335.25,
            'freight_currency' => 'USD',
            'freight_exchange_rate' => 335.25,
            'freight_cost_total' => round(1480000 / 335.25, 2),
            'loading_unloading_cost_lkr' => 157000,
            'additional_entry_cost_lkr' => 0,
            'transport_cost_lkr' => 64000,
            'delivery_order_charges_lkr' => 36000,
            'clearing_charges_lkr' => 92000,
            'demurrage_cost_lkr' => 0,
            'cid_rate_per_kg_lkr' => 30,
            'duty_base_percent' => 110,
            'vat_rate_percent' => 18,
            'sscl_rate_percent' => 2.5,
            'bank_interest_rate_pa' => 12,
            'bank_interest_months' => 3,
            'calculation_status' => 'draft',
            'items' => [
                [
                    'line_no' => 1,
                    'product_name' => 'Polyester Fabric Roll',
                    'unit_of_measure' => 'Yard',
                    'quantity' => 8200,
                    'unit_price_foreign' => 1.95,
                    'cbm' => 12.8,
                    'weight_kg' => 2450,
                    'customs_preset_value_foreign_or_base' => 1.72,
                ],
                [
                    'line_no' => 2,
                    'product_name' => 'Buttons - Pack',
                    'unit_of_measure' => 'Piece',
                    'quantity' => 45000,
                    'unit_price_foreign' => 0.05,
                    'cbm' => 3.4,
                    'weight_kg' => 820,
                    'customs_preset_value_foreign_or_base' => 0.28,
                ],
            ],
            'other_costs' => [
                ['cost_name' => 'Port Handling', 'amount_lkr' => 18500, 'sort_order' => 1],
                ['cost_name' => 'Inspection Fee', 'amount_lkr' => 9500, 'sort_order' => 2],
            ],
        ];

        $computed = app(DutyCostCalculationService::class)->calculate($payload);

        $row = DutyCostCalculation::create([
            'calculation_code' => 'DCC-1',
            'title' => $payload['title'],
            'supplier_name' => $payload['supplier_name'],
            'purchasing_currency' => $payload['purchasing_currency'],
            'local_currency' => $payload['local_currency'],
            'exchange_rate' => $payload['exchange_rate'],
            'freight_currency' => $payload['freight_currency'],
            'freight_exchange_rate' => $payload['freight_exchange_rate'],
            'total_shipment_cbm' => $computed['summary']['total_cbm'],
            'freight_cost_total' => $payload['freight_cost_total'],
            'loading_unloading_cost_lkr' => $payload['loading_unloading_cost_lkr'],
            'additional_entry_cost_lkr' => $payload['additional_entry_cost_lkr'],
            'transport_cost_lkr' => $payload['transport_cost_lkr'],
            'delivery_order_charges_lkr' => $payload['delivery_order_charges_lkr'],
            'clearing_charges_lkr' => $payload['clearing_charges_lkr'],
            'demurrage_cost_lkr' => $payload['demurrage_cost_lkr'],
            'cid_rate_per_kg_lkr' => $payload['cid_rate_per_kg_lkr'],
            'duty_base_percent' => $payload['duty_base_percent'],
            'vat_rate_percent' => $payload['vat_rate_percent'],
            'sscl_rate_percent' => $payload['sscl_rate_percent'],
            'bank_interest_rate_pa' => $payload['bank_interest_rate_pa'],
            'bank_interest_months' => $payload['bank_interest_months'],
            'other_costs_lkr_total' => $computed['summary']['other_costs_lkr_total'],
            'calculation_status' => 'draft',
            'totals' => $computed['summary'],
            'item_count' => $computed['summary']['item_count'],
            'total_product_value_lkr' => $computed['summary']['total_product_value_lkr'],
            'total_statistical_value_lkr' => $computed['summary']['total_statistical_value_lkr'],
            'total_customs_base_lkr' => $computed['summary']['total_customs_base_lkr'],
            'total_cid_lkr' => $computed['summary']['total_cid_lkr'],
            'total_vat_lkr' => $computed['summary']['total_vat_lkr'],
            'total_sscl_lkr' => $computed['summary']['total_sscl_lkr'],
            'total_duty_lkr' => $computed['summary']['total_duty_lkr'],
            'total_allocated_freight_lkr' => $computed['summary']['total_allocated_freight_lkr'],
            'total_allocated_other_costs_lkr' => $computed['summary']['total_allocated_other_costs_lkr'],
            'total_bank_charges_lkr' => $computed['summary']['total_bank_charges_lkr'],
            'grand_total_landed_cost_lkr' => $computed['summary']['grand_total_landed_cost_lkr'],
            'total_weight_kg' => $computed['summary']['total_weight_kg'],
            'total_cbm' => $computed['summary']['total_cbm'],
            'freight_cost_per_cbm_lkr' => $computed['summary']['freight_cost_per_cbm_lkr'],
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        $row->items()->createMany($computed['items']);
        $row->otherCosts()->createMany($computed['other_costs']);
    }
}
