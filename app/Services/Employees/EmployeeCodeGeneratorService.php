<?php

namespace App\Services\Employees;

use Illuminate\Support\Facades\DB;

class EmployeeCodeGeneratorService
{
    public function nextCode(): string
    {
        $max = DB::table('employees')
            ->selectRaw('MAX(CAST(SUBSTRING(employee_code, 3) AS UNSIGNED)) as max_number')
            ->where('employee_code', 'like', 'E-%')
            ->lockForUpdate()
            ->value('max_number');

        $next = ((int) $max) + 1;

        return 'E-'.$next;
    }
}
