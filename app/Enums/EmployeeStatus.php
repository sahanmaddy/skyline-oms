<?php

namespace App\Enums;

enum EmployeeStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
