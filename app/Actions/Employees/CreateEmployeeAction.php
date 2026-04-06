<?php

namespace App\Actions\Employees;

use App\Models\Employee;
use App\Services\Employees\EmployeeCodeGeneratorService;
use App\Services\Employees\PhoneNumberNormalizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CreateEmployeeAction
{
    public function __construct(
        private readonly EmployeeCodeGeneratorService $codeGenerator,
        private readonly PhoneNumberNormalizer $phoneNumberNormalizer,
    ) {}

    public function execute(
        array $employeeData,
        array $phoneNumbers = [],
        ?UploadedFile $profilePhoto = null
    ): Employee {
        return DB::transaction(function () use ($employeeData, $phoneNumbers, $profilePhoto) {
            $employeeData['employee_code'] = $this->codeGenerator->nextCode();

            /** @var Employee $employee */
            $employee = Employee::create($employeeData);

            $this->syncPhoneNumbers($employee, $phoneNumbers);

            if ($profilePhoto) {
                $employee->update([
                    'profile_photo_path' => $this->storeProfilePhoto(
                        $employee->employee_code,
                        $profilePhoto,
                    ),
                ]);
            }

            return $employee;
        });
    }

    private function syncPhoneNumbers(Employee $employee, array $phoneNumbers): void
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

        $employee->phoneNumbers()->createMany($clean->all());
    }

    private function storeProfilePhoto(string $employeeCode, UploadedFile $photo): string
    {
        $extension = strtolower(trim((string) $photo->getClientOriginalExtension()));
        $extension = $extension !== '' ? $extension : 'jpg';

        $uuid = (string) Str::uuid();
        $fileName = "{$employeeCode}-profile-{$uuid}.{$extension}";

        $path = "employees/profile-photos/{$employeeCode}/{$fileName}";

        Storage::disk('local')->putFileAs(
            dirname($path),
            $photo,
            basename($path),
        );

        return $path;
    }

    private function normalizeCountryIso2(mixed $value): ?string
    {
        if (! is_string($value) || strlen($value) !== 2) {
            return null;
        }

        return ctype_alpha($value) ? strtoupper($value) : null;
    }
}
