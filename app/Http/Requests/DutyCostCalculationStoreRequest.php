<?php

namespace App\Http\Requests;

use App\Models\DutyCostCalculation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DutyCostCalculationStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', DutyCostCalculation::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'reference_no' => ['nullable', 'string', 'max:120'],
            'supplier_name' => ['nullable', 'string', 'max:255'],
            'shipment_currency_basis_notes' => ['nullable', 'string'],
            'exchange_rate' => ['required', 'numeric', 'gt:0'],
            'exchange_rate_currency_label' => ['nullable', 'string', 'max:50'],
            'container_cbm_capacity' => ['nullable', 'numeric', 'gt:0'],
            'shipping_cost_total_lkr' => ['nullable', 'numeric', 'min:0'],
            'loading_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'unloading_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'transport_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'delivery_order_charges_lkr' => ['nullable', 'numeric', 'min:0'],
            'clearing_charges_lkr' => ['nullable', 'numeric', 'min:0'],
            'demurrage_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'calculation_status' => ['nullable', Rule::in(['draft', 'finalized'])],
            'other_costs' => ['nullable', 'array'],
            'other_costs.*.cost_name' => ['required_with:other_costs', 'string', 'max:120'],
            'other_costs.*.amount_lkr' => ['nullable', 'numeric', 'min:0'],
            'other_costs.*.remarks' => ['nullable', 'string', 'max:255'],
            'other_costs.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.line_no' => ['nullable', 'integer', 'min:1'],
            'items.*.product_name' => ['required', 'string', 'max:255'],
            'items.*.product_code' => ['nullable', 'string', 'max:120'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.product_currency' => ['required', Rule::in(['USD', 'CNY'])],
            'items.*.unit_of_measure' => ['required', Rule::in(['Yard', 'Meter', 'KG', 'Set', 'Piece'])],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price_foreign' => ['nullable', 'numeric', 'min:0'],
            'items.*.cbm' => ['nullable', 'numeric', 'min:0'],
            'items.*.weight_kg' => ['nullable', 'numeric', 'min:0'],
            'items.*.customs_preset_value_foreign_or_base' => ['nullable', 'numeric', 'min:0'],
            'items.*.cid_rate_per_kg_lkr' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $shippingCost = (float) $this->input('shipping_cost_total_lkr', 0);
            $capacity = (float) $this->input('container_cbm_capacity', 0);
            if ($shippingCost > 0 && $capacity <= 0) {
                $validator->errors()->add(
                    'container_cbm_capacity',
                    'Container CBM capacity is required when shipping cost is entered.',
                );
            }

            $items = $this->input('items', []);
            $totalWeight = array_sum(array_map(
                static fn ($row) => (float) ($row['weight_kg'] ?? 0),
                is_array($items) ? $items : [],
            ));

            $otherPool = (float) $this->input('loading_cost_lkr', 0)
                + (float) $this->input('unloading_cost_lkr', 0)
                + (float) $this->input('transport_cost_lkr', 0)
                + (float) $this->input('delivery_order_charges_lkr', 0)
                + (float) $this->input('clearing_charges_lkr', 0)
                + (float) $this->input('demurrage_cost_lkr', 0);

            foreach ($this->input('other_costs', []) as $row) {
                $otherPool += (float) ($row['amount_lkr'] ?? 0);
            }

            if ($otherPool > 0 && $totalWeight <= 0) {
                $validator->errors()->add(
                    'items',
                    'Total weight must be greater than zero to allocate other common costs.',
                );
            }
        });
    }
}

