<?php

use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Strip leading zeros from ATTR-* / ATTRV-* numeric suffixes (ATTR-001 → ATTR-1).
     */
    public function up(): void
    {
        $this->rewriteCodes(
            'product_attribute_types',
            ProductAttributeType::class,
            '/^ATTR-(\d+)$/',
            'ATTR-',
        );

        $this->rewriteCodes(
            'product_attribute_values',
            ProductAttributeValue::class,
            '/^ATTRV-(\d+)$/',
            'ATTRV-',
        );
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    private function rewriteCodes(string $table, string $modelClass, string $pattern, string $prefix): void
    {
        $rows = $modelClass::query()->orderBy('id')->get(['id', 'code']);

        $idToNew = [];
        foreach ($rows as $row) {
            if (preg_match($pattern, $row->code, $m)) {
                $newCode = $prefix.(int) $m[1];
                if ($newCode !== $row->code) {
                    $idToNew[$row->id] = $newCode;
                }
            }
        }

        if ($idToNew === []) {
            return;
        }

        $grouped = [];
        foreach ($idToNew as $id => $newCode) {
            $grouped[$newCode][] = $id;
        }
        foreach ($grouped as $newCode => $ids) {
            if (count($ids) > 1) {
                throw new \RuntimeException(
                    "Cannot normalize {$prefix}: duplicate code [{$newCode}] for ids [".implode(', ', $ids).']. Resolve manually.',
                );
            }
        }

        foreach (array_keys($idToNew) as $id) {
            DB::table($table)->where('id', $id)->update(['code' => $prefix.'__tmp__'.$id]);
        }

        foreach ($idToNew as $id => $newCode) {
            DB::table($table)->where('id', $id)->update(['code' => $newCode]);
        }
    }
};
