<?php

namespace App\Actions\Branches;

use App\Models\Branch;
use App\Services\Employees\PhoneNumberNormalizer;
use Illuminate\Support\Collection;

class SyncBranchPhoneNumbersAction
{
    public function __construct(private readonly PhoneNumberNormalizer $phoneNumberNormalizer) {}

    /**
     * Replace all phone numbers for the branch with the given list (normalized, non-empty rows only).
     */
    public function execute(Branch $branch, array $phoneNumbers): void
    {
        $clean = $this->normalizeRows($phoneNumbers);

        $branch->phoneNumbers()->delete();

        if ($clean->isEmpty()) {
            return;
        }

        $branch->phoneNumbers()->createMany($clean->all());
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function normalizeRows(array $phoneNumbers): Collection
    {
        return collect($phoneNumbers)
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
                    'is_primary' => (bool) ($row['is_primary'] ?? ($index === 0)),
                ];
            })
            ->filter(fn (array $row) => trim((string) $row['phone_number']) !== '')
            ->values();
    }

    private function normalizeCountryIso2(mixed $value): ?string
    {
        if (! is_string($value) || strlen($value) !== 2) {
            return null;
        }

        return ctype_alpha($value) ? strtoupper($value) : null;
    }
}
