<?php

namespace App\Actions\Customers;

use App\Models\Customer;
use App\Services\Customers\CustomerCodeGeneratorService;
use App\Services\Employees\PhoneNumberNormalizer;
use Illuminate\Support\Facades\DB;

class CreateCustomerAction
{
    public function __construct(
        private readonly CustomerCodeGeneratorService $codeGenerator,
        private readonly PhoneNumberNormalizer $phoneNumberNormalizer,
    ) {}

    public function execute(array $customerData, array $phoneNumbers = []): Customer
    {
        return DB::transaction(function () use ($customerData, $phoneNumbers) {
            $customerData['customer_code'] = $this->codeGenerator->nextCode();
            $customerData['display_name'] = $this->normalizeDisplayName($customerData);

            /** @var Customer $customer */
            $customer = Customer::create($customerData);

            $this->syncPhoneNumbers($customer, $phoneNumbers);

            return $customer;
        });
    }

    private function syncPhoneNumbers(Customer $customer, array $phoneNumbers): void
    {
        $clean = collect($phoneNumbers)
            ->filter(fn ($row) => is_array($row))
            ->map(function (array $row, int $index) {
                $normalizedPhoneNumber = $this->phoneNumberNormalizer->normalize(
                    $row['country_code'] ?? '+94',
                    $row['phone_number'] ?? '',
                );

                return [
                    'phone_type' => $row['phone_type'] ?? 'Mobile',
                    'country_code' => $row['country_code'] ?? '+94',
                    'country_iso2' => $this->normalizeCountryIso2($row['country_iso2'] ?? null),
                    'phone_number' => $normalizedPhoneNumber ?? '',
                    'is_primary' => (bool) ($row['is_primary'] ?? $index === 0),
                ];
            })
            ->filter(fn (array $row) => trim((string) $row['phone_number']) !== '')
            ->values();

        if ($clean->isEmpty()) {
            return;
        }

        $customer->phoneNumbers()->createMany($clean->all());
    }

    private function normalizeDisplayName(array $customerData): string
    {
        $displayName = trim((string) ($customerData['display_name'] ?? ''));
        $customerName = trim((string) ($customerData['customer_name'] ?? ''));

        return $displayName !== '' ? $displayName : $customerName;
    }

    private function normalizeCountryIso2(mixed $value): ?string
    {
        if (! is_string($value) || strlen($value) !== 2) {
            return null;
        }

        return ctype_alpha($value) ? strtoupper($value) : null;
    }
}
