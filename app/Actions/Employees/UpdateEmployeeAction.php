<?php

namespace App\Actions\Employees;

use App\Models\Employee;
use App\Services\Employees\PhoneNumberNormalizer;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UpdateEmployeeAction
{
    public function __construct(private readonly PhoneNumberNormalizer $phoneNumberNormalizer) {}

    public function execute(
        Employee $employee,
        array $employeeData,
        array $phoneNumbers = [],
        ?UploadedFile $profilePhoto = null
    ): Employee
    {
        return DB::transaction(function () use ($employee, $employeeData, $phoneNumbers, $profilePhoto) {
            unset($employeeData['employee_code']);

            $employee->update($employeeData);

            $this->syncPhoneNumbers($employee, $phoneNumbers);

            if ($profilePhoto) {
                if ($employee->profile_photo_path) {
                    Storage::disk('local')->delete($employee->profile_photo_path);
                }

                $employee->update([
                    'profile_photo_path' => $this->storeProfilePhoto(
                        $employee->employee_code,
                        $profilePhoto,
                    ),
                ]);
            }

            return $employee->refresh();
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
                    'phone_number' => $normalizedPhoneNumber ?? '',
                    'is_primary' => (bool) ($row['is_primary'] ?? $index === 0),
                ];
            })
            ->filter(fn (array $row) => trim((string) $row['phone_number']) !== '')
            ->values();

        $employee->phoneNumbers()->delete();

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
}
