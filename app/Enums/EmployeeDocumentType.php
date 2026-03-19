<?php

namespace App\Enums;

enum EmployeeDocumentType: string
{
    case Nic = 'NIC';
    case Cv = 'CV';
    case AppointmentLetter = 'Appointment Letter';
    case Contract = 'Contract';
    case Certificates = 'Certificates';
    case Other = 'Other';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
