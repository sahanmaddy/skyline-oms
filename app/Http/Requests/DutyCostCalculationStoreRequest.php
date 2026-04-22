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

    protected function prepareForValidation(): void
    {
        foreach (['purchasing_currency', 'local_currency', 'freight_currency'] as $key) {
            $code = $this->input($key);
            if (is_string($code)) {
                $this->merge([$key => strtoupper($code)]);
            }
        }

        foreach (['bank_interest_rate_pa', 'bank_interest_months'] as $key) {
            $v = $this->input($key);
            if ($v === '' || $v === null) {
                $this->merge([$key => null]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'supplier_name' => ['nullable', 'string', 'max:255'],
            'purchasing_currency' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'local_currency' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'shipment_currency_basis_notes' => ['nullable', 'string'],
            'exchange_rate' => ['required', 'numeric', 'gt:0'],
            'freight_currency' => ['nullable', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'freight_exchange_rate' => ['nullable', 'numeric', 'gt:0'],
            'freight_cost_total' => ['nullable', 'numeric', 'min:0'],
            'loading_unloading_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'transport_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'delivery_order_charges_lkr' => ['nullable', 'numeric', 'min:0'],
            'clearing_charges_lkr' => ['nullable', 'numeric', 'min:0'],
            'demurrage_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'additional_entry_cost_lkr' => ['nullable', 'numeric', 'min:0'],
            'cid_rate_per_kg_lkr' => ['nullable', 'numeric', 'min:0'],
            'duty_base_percent' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'vat_rate_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sscl_rate_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'bank_interest_rate_pa' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'bank_interest_months' => ['nullable', 'numeric', 'min:0', 'max:600'],
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
            'items.*.unit_of_measure' => ['required', Rule::in(['Yard', 'Meter', 'KG', 'Set', 'Piece'])],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price_foreign' => ['nullable', 'numeric', 'min:0'],
            'items.*.cbm' => ['nullable', 'numeric', 'min:0'],
            'items.*.weight_kg' => ['nullable', 'numeric', 'min:0'],
            'items.*.customs_preset_value_foreign_or_base' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $freightCost = (float) $this->input('freight_cost_total', 0);
            $items = $this->input('items', []);
            $sumCbm = array_sum(array_map(
                static fn ($row) => (float) ($row['cbm'] ?? 0),
                is_array($items) ? $items : [],
            ));
            if ($freightCost > 0 && $sumCbm <= 0) {
                $validator->errors()->add(
                    'items',
                    'Enter CBM on each product (total must be greater than zero) when freight cost is entered.',
                );
            }
            if ($freightCost > 0) {
                $fc = $this->input('freight_currency');
                if (! is_string($fc) || strlen(trim($fc)) !== 3) {
                    $validator->errors()->add('freight_currency', 'Freight currency is required when freight cost is entered.');
                }
                if ((float) $this->input('freight_exchange_rate', 0) <= 0) {
                    $validator->errors()->add('freight_exchange_rate', 'Freight exchange rate is required when freight cost is entered.');
                }
            }

            $totalWeight = array_sum(array_map(
                static fn ($row) => (float) ($row['weight_kg'] ?? 0),
                is_array($items) ? $items : [],
            ));

            $otherPool = (float) $this->input('loading_unloading_cost_lkr', 0)
                + (float) $this->input('transport_cost_lkr', 0)
                + (float) $this->input('delivery_order_charges_lkr', 0)
                + (float) $this->input('clearing_charges_lkr', 0)
                + (float) $this->input('demurrage_cost_lkr', 0)
                + (float) $this->input('additional_entry_cost_lkr', 0);

            foreach ($this->input('other_costs', []) as $row) {
                $otherPool += (float) ($row['amount_lkr'] ?? 0);
            }

            if ($otherPool > 0 && $totalWeight <= 0) {
                $validator->errors()->add(
                    'items',
                    'Total weight across products must be greater than zero to allocate other common costs.',
                );
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'freight_cost_total' => 'Freight cost',
            'loading_unloading_cost_lkr' => 'Loading / unloading cost',
            'additional_entry_cost_lkr' => 'Additional entry',
            'freight_currency' => 'Freight currency',
            'freight_exchange_rate' => 'Freight exchange rate',
            'bank_interest_rate_pa' => 'Bank Interest Rate (Per Annum)',
            'bank_interest_months' => 'Number of Months',
            'duty_base_percent' => 'Customs Base Value (%)',
        ];
    }
}
