<?php

namespace Database\Seeders;

use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InventoryMasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUnits();
        $this->seedAttributeTypesAndValues();
    }

    private function seedUnits(): void
    {
        $rows = [
            [
                'unit_code' => 'UOM-1',
                'name' => 'Meter',
                'symbol' => 'm',
                'decimal_precision' => 2,
                'allow_decimal' => true,
                'is_base_unit' => false,
                'is_system' => true,
                'status' => 'active',
            ],
            [
                'unit_code' => 'UOM-2',
                'name' => 'Yard',
                'symbol' => 'yd',
                'decimal_precision' => 2,
                'allow_decimal' => true,
                'is_base_unit' => false,
                'is_system' => true,
                'status' => 'active',
            ],
            [
                'unit_code' => 'UOM-3',
                'name' => 'KG',
                'symbol' => 'kg',
                'decimal_precision' => 2,
                'allow_decimal' => true,
                'is_base_unit' => false,
                'is_system' => true,
                'status' => 'active',
            ],
            [
                'unit_code' => 'UOM-4',
                'name' => 'Roll',
                'symbol' => 'roll',
                'decimal_precision' => 0,
                'allow_decimal' => false,
                'is_base_unit' => false,
                'is_system' => true,
                'status' => 'active',
            ],
            [
                'unit_code' => 'UOM-5',
                'name' => 'PCS',
                'symbol' => 'pcs',
                'decimal_precision' => 0,
                'allow_decimal' => false,
                'is_base_unit' => false,
                'is_system' => true,
                'status' => 'active',
            ],
            [
                'unit_code' => 'UOM-6',
                'name' => 'Set',
                'symbol' => 'set',
                'decimal_precision' => 0,
                'allow_decimal' => false,
                'is_base_unit' => false,
                'is_system' => true,
                'status' => 'active',
            ],
        ];

        foreach ($rows as $row) {
            UnitOfMeasure::query()->updateOrInsert(
                ['unit_code' => $row['unit_code']],
                array_merge($row, ['updated_at' => now(), 'created_at' => now()]),
            );
        }
    }

    private function seedAttributeTypesAndValues(): void
    {
        $types = [
            ['name' => 'Color', 'sort_order' => 1],
            ['name' => 'Width', 'sort_order' => 2],
            ['name' => 'GSM', 'sort_order' => 3],
            ['name' => 'oz/yd²', 'sort_order' => 4],
            ['name' => 'Composition', 'sort_order' => 5],
            ['name' => 'Brand', 'sort_order' => 6],
            ['name' => 'Finish', 'sort_order' => 7],
            ['name' => 'Pattern', 'sort_order' => 8],
            ['name' => 'Stretch', 'sort_order' => 9],
            ['name' => 'Other', 'sort_order' => 10],
        ];

        $typeModels = [];
        foreach ($types as $i => $t) {
            $code = 'ATTR-'.($i + 1);
            $slugBase = Str::slug($t['name']) ?: 'attribute-'.($i + 1);
            $slug = $slugBase;
            $n = 1;
            while (ProductAttributeType::query()->where('slug', $slug)->exists()) {
                $slug = $slugBase.'-'.$n;
                $n++;
            }

            $typeModels[$t['name']] = ProductAttributeType::query()->updateOrCreate(
                ['name' => $t['name']],
                [
                    'code' => $code,
                    'slug' => $slug,
                    'description' => null,
                    'status' => 'active',
                    'sort_order' => $t['sort_order'],
                ],
            );
        }

        $valueSeeds = [
            'Color' => ['Black', 'White', 'Navy Blue', 'Khaki', 'Brown', 'Olive Green'],
            'Width' => ['58"', '60"', '72"'],
            'GSM' => ['160 GSM', '180 GSM', '220 GSM'],
            'oz/yd²' => ['8 oz', '10 oz', '12 oz', '14 oz'],
            'Composition' => ['100% Cotton', 'Cotton Lycra', 'Polyester Cotton', 'Rayon', 'Viscose'],
        ];

        $attrvCounter = 1;
        foreach ($valueSeeds as $typeName => $values) {
            $type = $typeModels[$typeName] ?? null;
            if (! $type) {
                continue;
            }
            foreach (array_values($values) as $index => $value) {
                $code = 'ATTRV-'.$attrvCounter;
                $attrvCounter++;

                ProductAttributeValue::query()->updateOrCreate(
                    [
                        'product_attribute_type_id' => $type->id,
                        'value' => $value,
                    ],
                    [
                        'code' => $code,
                        'display_value' => null,
                        'description' => null,
                        'status' => 'active',
                        'sort_order' => $index + 1,
                    ],
                );
            }
        }
    }
}
