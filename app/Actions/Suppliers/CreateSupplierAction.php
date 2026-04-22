<?php

namespace App\Actions\Suppliers;

use App\Models\Supplier;
use App\Services\Suppliers\SupplierCodeGeneratorService;
use Illuminate\Support\Facades\DB;

class CreateSupplierAction
{
    public function __construct(private readonly SupplierCodeGeneratorService $codeGenerator) {}

    public function execute(array $supplierData): Supplier
    {
        return DB::transaction(function () use ($supplierData) {
            $supplierData['supplier_code'] = $this->codeGenerator->nextCode();
            $supplierData['display_name'] = $this->normalizeDisplayName($supplierData);

            return Supplier::create($supplierData);
        });
    }

    private function normalizeDisplayName(array $supplierData): string
    {
        $displayName = trim((string) ($supplierData['display_name'] ?? ''));
        $companyName = trim((string) ($supplierData['company_name'] ?? ''));

        return $displayName !== '' ? $displayName : $companyName;
    }
}
