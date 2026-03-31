<?php

namespace App\Enums;

enum EmployeeDepartment: string
{
    case Management = 'Management';
    case SalesAndMarketing = 'Sales and Marketing';
    case AccountingAndFinance = 'Accounting and Finance';
    case HumanResources = 'Human Resources';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
