<?php

use App\Models\ProductAttributeValue;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Assign sort_order within each attribute type using natural sort on `value`
     * (so e.g. "8 oz" precedes "10 oz"), with id as a stable tie-breaker.
     */
    public function up(): void
    {
        $byType = ProductAttributeValue::query()
            ->orderBy('id')
            ->get()
            ->groupBy('product_attribute_type_id');

        foreach ($byType as $rows) {
            $sorted = $rows->values()->sort(function (ProductAttributeValue $a, ProductAttributeValue $b) {
                $cmp = strnatcasecmp($a->value, $b->value);
                if ($cmp !== 0) {
                    return $cmp;
                }

                return $a->id <=> $b->id;
            })->values();

            foreach ($sorted as $index => $value) {
                ProductAttributeValue::query()->whereKey($value->id)->update([
                    'sort_order' => $index + 1,
                ]);
            }
        }
    }
};
