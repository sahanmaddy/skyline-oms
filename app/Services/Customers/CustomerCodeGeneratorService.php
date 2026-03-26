<?php

namespace App\Services\Customers;

use Illuminate\Support\Facades\DB;

class CustomerCodeGeneratorService
{
    public function nextCode(): string
    {
        $max = DB::table('customers')
            ->selectRaw('MAX(CAST(SUBSTRING(customer_code, 3) AS UNSIGNED)) as max_number')
            ->where('customer_code', 'like', 'C-%')
            ->lockForUpdate()
            ->value('max_number');

        $next = ((int) $max) + 1;

        return 'C-'.$next;
    }
}

