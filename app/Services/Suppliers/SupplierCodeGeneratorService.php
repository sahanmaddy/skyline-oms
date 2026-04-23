<?php

namespace App\Services\Suppliers;

use Illuminate\Support\Facades\DB;

class SupplierCodeGeneratorService
{
    public function nextCode(): string
    {
        $max = DB::table('suppliers')
            ->selectRaw("
                MAX(
                    CAST(
                        CASE
                            WHEN supplier_code LIKE 'SUP-%' THEN SUBSTRING(supplier_code, 5)
                            WHEN supplier_code LIKE 'S-%' THEN SUBSTRING(supplier_code, 3)
                            ELSE 0
                        END AS UNSIGNED
                    )
                ) as max_number
            ")
            ->where(function ($query) {
                $query->where('supplier_code', 'like', 'SUP-%')
                    ->orWhere('supplier_code', 'like', 'S-%');
            })
            ->lockForUpdate()
            ->value('max_number');

        $next = ((int) $max) + 1;

        return 'S-'.$next;
    }
}
