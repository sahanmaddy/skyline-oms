<?php

namespace App\Actions\Customers;

use App\Models\Customer;
use App\Services\Employees\PhoneNumberNormalizer;
use Illuminate\Support\Facades\DB;

class UpdateCustomerAction
{
    public function __construct(private readonly PhoneNumberNormalizer $phoneNumberNormalizer) {}

    public function execute(Customer $customer, array $customerData, array $phoneNumbers = []): Customer
    {
        if ($customer->isSystemCashCustomer()) {
            abort(403);
        }

        return DB::transaction(function () use ($customer, $customerData, $phoneNumbers) {
            unset($customerData['customer_code']);
            $customerData['display_name'] = $this->normalizeDisplayName($customerData);

            $customer->update($customerData);
            $this->syncPhoneNumbers($customer, $phoneNumbers);

            return $customer->refresh();
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
                    'phone_number' => $normalizedPhoneNumber ?? '',
                    'is_primary' => (bool) ($row['is_primary'] ?? $index === 0),
                ];
            })
            ->filter(fn (array $row) => trim((string) $row['phone_number']) !== '')
            ->values();

        $customer->phoneNumbers()->delete();

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
}
