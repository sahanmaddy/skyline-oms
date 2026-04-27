<?php

namespace App\Services\Procurement;

class DutyCostCalculationService
{
    public function calculate(array $payload): array
    {
        $exchangeRate = $this->num($payload['exchange_rate'] ?? 0);
        $purchasingCurrency = strtoupper(trim((string) ($payload['purchasing_currency'] ?? 'USD')));
        if ($purchasingCurrency === '') {
            $purchasingCurrency = 'USD';
        }
        $freightExchangeRate = $this->num($payload['freight_exchange_rate'] ?? 0);
        $freightCostForeign = $this->money($payload['freight_cost_total'] ?? 0);
        $freightCostLocal = $this->money($freightCostForeign * $freightExchangeRate);

        $extraCosts = array_values(array_map(function (array $row, int $index): array {
            return [
                'cost_name' => trim((string) ($row['cost_name'] ?? '')),
                'amount_lkr' => $this->money($row['amount_lkr'] ?? 0),
                'remarks' => trim((string) ($row['remarks'] ?? '')) ?: null,
                'sort_order' => (int) ($row['sort_order'] ?? ($index + 1)),
            ];
        }, $payload['other_costs'] ?? [], array_keys($payload['other_costs'] ?? [])));

        $otherCostRowsTotal = $this->money(array_sum(array_column($extraCosts, 'amount_lkr')));

        $otherCommonCostPool = $this->money(
            $this->num($payload['loading_unloading_cost_lkr'] ?? 0)
            + $this->num($payload['transport_cost_lkr'] ?? 0)
            + $this->num($payload['delivery_order_charges_lkr'] ?? 0)
            + $this->num($payload['clearing_charges_lkr'] ?? 0)
            + $this->num($payload['demurrage_cost_lkr'] ?? 0)
            + $this->num($payload['additional_entry_cost_lkr'] ?? 0)
            + $otherCostRowsTotal
        );

        $shipmentCidRate = $this->money($this->numOrDefault($payload['cid_rate_per_kg_lkr'] ?? null, 0));
        $cidBasis = strtolower(trim((string) ($payload['cid_basis'] ?? 'weight')));
        if (! in_array($cidBasis, ['weight', 'uom'], true)) {
            $cidBasis = 'weight';
        }
        $shipmentEidRate = $this->money($this->numOrDefault($payload['eid_rate_per_kg_lkr'] ?? null, 0));
        $eidBasis = strtolower(trim((string) ($payload['eid_basis'] ?? 'weight')));
        if (! in_array($eidBasis, ['weight', 'uom'], true)) {
            $eidBasis = 'weight';
        }
        $statisticalValueBasis = strtolower(trim((string) ($payload['statistical_value_basis'] ?? 'weight')));
        if (! in_array($statisticalValueBasis, ['weight', 'uom'], true)) {
            $statisticalValueBasis = 'weight';
        }
        $dutyBasePercent = $this->numOrDefault($payload['duty_base_percent'] ?? null, 0);
        $dutyBaseMultiplier = $dutyBasePercent > 0 ? $dutyBasePercent / 100.0 : 0.0;
        $vatRate = $this->numOrDefault($payload['vat_rate_percent'] ?? null, 0) / 100.0;
        $ssclRate = $this->numOrDefault($payload['sscl_rate_percent'] ?? null, 0) / 100.0;

        $baseItems = [];
        foreach (($payload['items'] ?? []) as $idx => $row) {
            $lineNo = (int) ($row['line_no'] ?? ($idx + 1));
            $qty = $this->num($row['quantity'] ?? 0);
            $unitPrice = $this->num($row['unit_price_foreign'] ?? 0);
            $cbm = $this->num($row['cbm'] ?? 0);
            $weight = $this->num($row['weight_kg'] ?? 0);
            $customsPreset = $this->num($row['customs_preset_value_foreign_or_base'] ?? 0);

            $totalProductValueForeign = $this->qty($qty * $unitPrice, 2);
            $productValueLkr = $this->money($totalProductValueForeign * $exchangeRate);

            $statisticalBaseValue = $statisticalValueBasis === 'uom' ? $qty : $weight;
            $statisticalValue = $this->money($customsPreset * $statisticalBaseValue * $exchangeRate);
            $customsBase110 = $this->money($statisticalValue * $dutyBaseMultiplier);
            $cidBaseValue = $cidBasis === 'uom' ? $qty : $weight;
            $cid = $this->money($cidBaseValue * $shipmentCidRate);
            $eidBaseValue = $eidBasis === 'uom' ? $qty : $weight;
            $eid = $this->money($eidBaseValue * $shipmentEidRate);
            $taxBase = $customsBase110 + $cid + $eid;
            $vat = $this->money($taxBase * $vatRate);
            $sscl = $this->money($taxBase * $ssclRate);
            $dutyTotal = $this->money($cid + $eid + $vat + $sscl);

            $baseItems[] = [
                'line_no' => $lineNo,
                'product_name' => trim((string) ($row['product_name'] ?? '')),
                'product_code' => trim((string) ($row['product_code'] ?? '')) ?: null,
                'description' => trim((string) ($row['description'] ?? '')) ?: null,
                'product_currency' => $purchasingCurrency,
                'unit_of_measure' => (string) ($row['unit_of_measure'] ?? ''),
                'quantity' => $this->qty($qty, 2),
                'unit_price_foreign' => $this->qty($unitPrice, 2),
                'total_product_value_foreign' => $totalProductValueForeign,
                'cbm' => $this->qty($cbm, 3),
                'weight_kg' => $this->qty($weight, 3),
                'customs_preset_value_foreign_or_base' => $this->qty($customsPreset, 2),
                'cid_rate_per_kg_lkr' => $shipmentCidRate,
                'eid_rate_per_kg_lkr' => $shipmentEidRate,
                'statistical_value_lkr' => $statisticalValue,
                'customs_base_110_lkr' => $customsBase110,
                'cid_lkr' => $cid,
                'eid_lkr' => $eid,
                'vat_lkr' => $vat,
                'sscl_lkr' => $sscl,
                'duty_total_lkr' => $dutyTotal,
                'product_value_lkr' => $productValueLkr,
            ];
        }

        $totalWeight = array_sum(array_column($baseItems, 'weight_kg'));
        $totalCbm = array_sum(array_column($baseItems, 'cbm'));
        $totalShipmentCbm = $totalCbm;
        $freightCostPerCbmLocal = $totalShipmentCbm > 0
            ? $this->money($freightCostLocal / $totalShipmentCbm)
            : 0.0;

        $purchaseShipmentLkr = $this->money(array_sum(array_column($baseItems, 'product_value_lkr')));
        $bankBaseLkr = $this->money($purchaseShipmentLkr + $freightCostLocal);
        $bankRatePa = $this->num($payload['bank_interest_rate_pa'] ?? 0);
        $bankMonths = $this->num($payload['bank_interest_months'] ?? 0);
        $bankTransferCharges = $bankBaseLkr > 0
            ? $this->money($bankBaseLkr * 0.01)
            : 0.0;
        $bankInterest = ($bankBaseLkr > 0 && $bankRatePa > 0 && $bankMonths > 0)
            ? $this->money($bankBaseLkr * ($bankRatePa / 100.0) * ($bankMonths / 12.0))
            : 0.0;
        $bankChargesPool = $this->money($bankTransferCharges + $bankInterest);

        $items = array_map(function (array $item) use ($freightCostPerCbmLocal, $otherCommonCostPool, $totalWeight, $bankChargesPool, $bankBaseLkr): array {
            $allocatedFreight = $this->money($item['cbm'] * $freightCostPerCbmLocal);
            $allocatedOther = $totalWeight > 0
                ? $this->money(($item['weight_kg'] / $totalWeight) * $otherCommonCostPool)
                : 0.0;
            $allocatedBank = ($bankBaseLkr > 0 && $bankChargesPool > 0)
                ? $this->money($bankChargesPool * (($item['product_value_lkr'] + $allocatedFreight) / $bankBaseLkr))
                : 0.0;

            $totalLanded = $this->money(
                $item['product_value_lkr']
                + $item['duty_total_lkr']
                + $allocatedFreight
                + $allocatedOther
                + $allocatedBank
            );

            $perUnit = $item['quantity'] > 0 ? $this->money($totalLanded / $item['quantity']) : 0.0;
            $item['allocated_freight_lkr'] = $allocatedFreight;
            $item['allocated_other_costs_lkr'] = $allocatedOther;
            $item['allocated_bank_charges_lkr'] = $allocatedBank;
            $item['total_landed_cost_lkr'] = $totalLanded;
            $item['landed_cost_per_unit_lkr'] = $perUnit;
            $item['landed_cost_per_kg_lkr'] = null;
            $item['landed_cost_per_meter_lkr'] = null;
            $item['landed_cost_per_yard_lkr'] = null;
            $item['landed_cost_per_piece_lkr'] = null;
            $item['landed_cost_per_set_lkr'] = null;

            $bucket = $this->landedCostUomBucket((string) $item['unit_of_measure']);
            if ($bucket === 'kg') {
                $item['landed_cost_per_kg_lkr'] = $perUnit;
            } elseif ($bucket === 'meter') {
                $item['landed_cost_per_meter_lkr'] = $perUnit;
            } elseif ($bucket === 'yard') {
                $item['landed_cost_per_yard_lkr'] = $perUnit;
            } elseif ($bucket === 'piece') {
                $item['landed_cost_per_piece_lkr'] = $perUnit;
            } elseif ($bucket === 'set') {
                $item['landed_cost_per_set_lkr'] = $perUnit;
            }

            return $item;
        }, $baseItems);

        $summary = [
            'item_count' => count($items),
            'total_product_value_foreign' => $this->qty(array_sum(array_column($items, 'total_product_value_foreign')), 2),
            'total_product_value_lkr' => $this->money(array_sum(array_column($items, 'product_value_lkr'))),
            'total_statistical_value_lkr' => $this->money(array_sum(array_column($items, 'statistical_value_lkr'))),
            'total_customs_base_lkr' => $this->money(array_sum(array_column($items, 'customs_base_110_lkr'))),
            'total_cid_lkr' => $this->money(array_sum(array_column($items, 'cid_lkr'))),
            'total_eid_lkr' => $this->money(array_sum(array_column($items, 'eid_lkr'))),
            'total_vat_lkr' => $this->money(array_sum(array_column($items, 'vat_lkr'))),
            'total_sscl_lkr' => $this->money(array_sum(array_column($items, 'sscl_lkr'))),
            'total_duty_lkr' => $this->money(array_sum(array_column($items, 'duty_total_lkr'))),
            'total_allocated_freight_lkr' => $this->money(array_sum(array_column($items, 'allocated_freight_lkr'))),
            'total_allocated_other_costs_lkr' => $this->money(array_sum(array_column($items, 'allocated_other_costs_lkr'))),
            'bank_transfer_charges_lkr' => $bankTransferCharges,
            'bank_interest_lkr' => $bankInterest,
            'total_bank_charges_lkr' => $this->money(array_sum(array_column($items, 'allocated_bank_charges_lkr'))),
            'remittance_lkr' => $this->money($purchaseShipmentLkr + $freightCostLocal),
            'grand_total_landed_cost_lkr' => $this->money(array_sum(array_column($items, 'total_landed_cost_lkr'))),
            'total_weight_kg' => $this->qty($totalWeight, 3),
            'total_cbm' => $this->qty($totalCbm, 3),
            'freight_cost_per_cbm_lkr' => $freightCostPerCbmLocal,
            'other_common_cost_pool_lkr' => $otherCommonCostPool,
            'other_costs_lkr_total' => $otherCostRowsTotal,
        ];

        return [
            'items' => $items,
            'other_costs' => $extraCosts,
            'summary' => $summary,
        ];
    }

    /**
     * Map inventory UOM display names (e.g. Meter, PCS, KG) to landed-cost column buckets.
     */
    private function landedCostUomBucket(string $raw): ?string
    {
        $collapsed = preg_replace('/\s+/u', '', $raw);
        $n = strtolower(trim(is_string($collapsed) ? $collapsed : $raw));

        if ($n === '' || $n === '0') {
            return null;
        }

        return match (true) {
            $n === 'kg' || $n === 'kgs' || str_contains($n, 'kilogram') => 'kg',
            in_array($n, ['m', 'meter', 'metre', 'meters'], true) => 'meter',
            in_array($n, ['yard', 'yards', 'yd'], true) => 'yard',
            in_array($n, ['piece', 'pieces', 'pcs', 'pc'], true) => 'piece',
            in_array($n, ['set', 'sets'], true) => 'set',
            default => null,
        };
    }

    private function numOrDefault(mixed $value, float $default): float
    {
        if ($value === null || $value === '') {
            return $default;
        }

        return is_numeric($value) ? (float) $value : $default;
    }

    private function num(mixed $value): float
    {
        return (float) (is_numeric($value) ? $value : 0);
    }

    private function money(mixed $value): float
    {
        return round($this->num($value), 2);
    }

    private function qty(mixed $value, int $precision = 4): float
    {
        return round($this->num($value), $precision);
    }
}
