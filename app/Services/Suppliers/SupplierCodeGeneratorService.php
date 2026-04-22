<?php

namespace App\Services\Suppliers;

use Illuminate\Support\Facades\DB;

class SupplierCodeGeneratorService
{
    public function nextCode(): string
    {
        $max = DB::table('suppliers')
            ->selectRaw("MAX(CAST(SUBSTRING(supplier_code, 5) AS UNSIGNED)) as max_number")
            ->where('supplier_code', 'like', 'SUP-%')
            ->lockForUpdate()
            ->value('max_number');

        $next = ((int) $max) + 1;

        return 'SUP-'.str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }
}
