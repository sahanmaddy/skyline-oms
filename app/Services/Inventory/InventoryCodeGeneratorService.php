<?php

namespace App\Services\Inventory;

use Illuminate\Support\Facades\DB;

class InventoryCodeGeneratorService
{
    /**
     * @param  non-empty-string  $table
     * @param  non-empty-string  $column
     * @param  non-empty-string  $prefix  e.g. CAT-, ATTR-, ATTRV-, UOM-
     * @param  int  $minDigits  Zero-pad the numeric suffix to this width; use 0 for no padding (e.g. ATTR-1).
     */
    public function nextSequentialCode(string $table, string $column, string $prefix, int $minDigits = 3): string
    {
        $codes = DB::table($table)
            ->where($column, 'like', $prefix.'%')
            ->lockForUpdate()
            ->pluck($column);

        $max = $codes
            ->map(fn (string $code) => (int) substr($code, strlen($prefix)))
            ->max() ?? 0;

        $next = $max + 1;

        if ($minDigits < 1) {
            return $prefix.$next;
        }

        return $prefix.str_pad((string) $next, $minDigits, '0', STR_PAD_LEFT);
    }
}
