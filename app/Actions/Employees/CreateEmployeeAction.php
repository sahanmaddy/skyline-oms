<?php

namespace App\Actions\Employees;

use App\Models\Employee;
use App\Services\Employees\EmployeeCodeGeneratorService;
use App\Services\Employees\PhoneNumberNormalizer;
use Illuminate\Support\Facades\DB;

class CreateEmployeeAction
{
    public function __construct(
        private readonly EmployeeCodeGeneratorService $codeGenerator,
        private readonly PhoneNumberNormalizer $phoneNumberNormalizer,
    ) {}

    public function execute(array $employeeData, array $phoneNumbers = []): Employee
    {
        return DB::transaction(function () use ($employeeData, $phoneNumbers) {
            $employeeData['employee_code'] = $this->codeGenerator->nextCode();

            /** @var Employee $employee */
            $employee = Employee::create($employeeData);

            $this->syncPhoneNumbers($employee, $phoneNumbers);

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
}
