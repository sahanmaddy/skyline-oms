<?php

namespace App\Services\Branches;

use Illuminate\Support\Facades\DB;

class BranchCodeGeneratorService
{
    public function nextCode(): string
    {
        $max = DB::table('branches')
            ->selectRaw('MAX(CAST(SUBSTRING(code, 4) AS UNSIGNED)) as max_number')
            ->where('code', 'like', 'BR-%')
            ->lockForUpdate()
            ->value('max_number');

        $next = ((int) $max) + 1;

        return 'BR-'.str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }
}
