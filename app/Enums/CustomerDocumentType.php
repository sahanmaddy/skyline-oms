<?php

namespace App\Enums;

enum CustomerDocumentType: string
{
    case Nic = 'NIC';
    case Kyc = 'KYC';
    case BusinessRegistration = 'Business Registration';
    case CreditApplication = 'Credit Application';
    case BankDetails = 'Bank Details';
    case Other = 'Other';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
