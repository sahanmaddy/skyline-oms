<?php

namespace App\Enums;

enum CustomerDocumentType: string
{
    case NicOrIdCopy = 'NIC / ID Copy';
    case BusinessRegistration = 'Business Registration';
    case AgreementOrContract = 'Agreement / Contract';
    case CreditApplication = 'Credit Application';
    case ChequeOrPdcCopy = 'Cheque / PDC Copy';
    case BankDetails = 'Bank Details';
    case Other = 'Other';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}

