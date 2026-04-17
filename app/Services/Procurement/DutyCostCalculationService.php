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
        $totalShipmentCbm = $this->num($payload['total_shipment_cbm'] ?? 0);

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
            $this->num($payload['loading_cost_lkr'] ?? 0)
            + $this->num($payload['unloading_cost_lkr'] ?? 0)
            + $this->num($payload['transport_cost_lkr'] ?? 0)
            + $this->num($payload['delivery_order_charges_lkr'] ?? 0)
            + $this->num($payload['clearing_charges_lkr'] ?? 0)
            + $this->num($payload['demurrage_cost_lkr'] ?? 0)
            + $otherCostRowsTotal
        );

        $freightCostPerCbmLocal = $totalShipmentCbm > 0
            ? $this->money($freightCostLocal / $totalShipmentCbm)
            : 0.0;

        $baseItems = [];
        foreach (($payload['items'] ?? []) as $idx => $row) {
            $lineNo = (int) ($row['line_no'] ?? ($idx + 1));
            $qty = $this->num($row['quantity'] ?? 0);
            $unitPrice = $this->num($row['unit_price_foreign'] ?? 0);
            $cbm = $this->num($row['cbm'] ?? 0);
            $weight = $this->num($row['weight_kg'] ?? 0);
            $customsPreset = $this->num($row['customs_preset_value_foreign_or_base'] ?? 0);
            $cidRate = $this->money($row['cid_rate_per_kg_lkr'] ?? 30);

            $totalProductValueForeign = $this->qty($qty * $unitPrice);
            $productValueLkr = $this->money($totalProductValueForeign * $exchangeRate);

            $statisticalValue = $this->money($customsPreset * $weight * $exchangeRate);
            $customsBase110 = $this->money($statisticalValue * 1.10);
            $cid = $this->money($weight * $cidRate);
            $vat = $this->money(($customsBase110 + $cid) * 0.18);
            $sscl = $this->money(($customsBase110 + $cid) * 0.025);
            $dutyTotal = $this->money($cid + $vat + $sscl);

            $baseItems[] = [
                'line_no' => $lineNo,
                'product_name' => trim((string) ($row['product_name'] ?? '')),
                'product_code' => trim((string) ($row['product_code'] ?? '')) ?: null,
                'description' => trim((string) ($row['description'] ?? '')) ?: null,
                'product_currency' => $purchasingCurrency,
                'unit_of_measure' => (string) ($row['unit_of_measure'] ?? 'Piece'),
                'quantity' => $this->qty($qty),
                'unit_price_foreign' => $this->qty($unitPrice),
                'total_product_value_foreign' => $totalProductValueForeign,
                'cbm' => $this->qty($cbm),
                'weight_kg' => $this->qty($weight),
                'customs_preset_value_foreign_or_base' => $this->qty($customsPreset),
                'cid_rate_per_kg_lkr' => $cidRate,
                'statistical_value_lkr' => $statisticalValue,
                'customs_base_110_lkr' => $customsBase110,
                'cid_lkr' => $cid,
                'vat_lkr' => $vat,
                'sscl_lkr' => $sscl,
                'duty_total_lkr' => $dutyTotal,
                'product_value_lkr' => $productValueLkr,
            ];
        }

        $totalWeight = array_sum(array_column($baseItems, 'weight_kg'));
        $totalCbm = array_sum(array_column($baseItems, 'cbm'));

        $items = array_map(function (array $item) use ($freightCostPerCbmLocal, $otherCommonCostPool, $totalWeight): array {
            $allocatedFreight = $this->money($item['cbm'] * $freightCostPerCbmLocal);
            $allocatedOther = $totalWeight > 0
                ? $this->money(($item['weight_kg'] / $totalWeight) * $otherCommonCostPool)
                : 0.0;

            $totalLanded = $this->money(
                $item['product_value_lkr']
                + $item['duty_total_lkr']
                + $allocatedFreight
                + $allocatedOther
            );

            $perUnit = $item['quantity'] > 0 ? $this->money($totalLanded / $item['quantity']) : 0.0;
            $item['allocated_freight_lkr'] = $allocatedFreight;
            $item['allocated_other_costs_lkr'] = $allocatedOther;
            $item['total_landed_cost_lkr'] = $totalLanded;
            $item['landed_cost_per_unit_lkr'] = $perUnit;
            $item['landed_cost_per_kg_lkr'] = null;
            $item['landed_cost_per_meter_lkr'] = null;
            $item['landed_cost_per_yard_lkr'] = null;
            $item['landed_cost_per_piece_lkr'] = null;
            $item['landed_cost_per_set_lkr'] = null;

            $uom = strtolower((string) $item['unit_of_measure']);
            if ($uom === 'kg') {
                $item['landed_cost_per_kg_lkr'] = $perUnit;
            } elseif ($uom === 'meter') {
                $item['landed_cost_per_meter_lkr'] = $perUnit;
            } elseif ($uom === 'yard') {
                $item['landed_cost_per_yard_lkr'] = $perUnit;
            } elseif ($uom === 'piece') {
                $item['landed_cost_per_piece_lkr'] = $perUnit;
            } elseif ($uom === 'set') {
                $item['landed_cost_per_set_lkr'] = $perUnit;
            }

            return $item;
        }, $baseItems);

        $summary = [
            'item_count' => count($items),
            'total_product_value_lkr' => $this->money(array_sum(array_column($items, 'product_value_lkr'))),
            'total_statistical_value_lkr' => $this->money(array_sum(array_column($items, 'statistical_value_lkr'))),
            'total_cid_lkr' => $this->money(array_sum(array_column($items, 'cid_lkr'))),
            'total_vat_lkr' => $this->money(array_sum(array_column($items, 'vat_lkr'))),
            'total_sscl_lkr' => $this->money(array_sum(array_column($items, 'sscl_lkr'))),
            'total_duty_lkr' => $this->money(array_sum(array_column($items, 'duty_total_lkr'))),
            'total_allocated_freight_lkr' => $this->money(array_sum(array_column($items, 'allocated_freight_lkr'))),
            'total_allocated_other_costs_lkr' => $this->money(array_sum(array_column($items, 'allocated_other_costs_lkr'))),
            'grand_total_landed_cost_lkr' => $this->money(array_sum(array_column($items, 'total_landed_cost_lkr'))),
            'total_weight_kg' => $this->qty($totalWeight, 3),
            'total_cbm' => $this->qty($totalCbm, 4),
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

