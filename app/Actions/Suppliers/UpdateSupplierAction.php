<?php

namespace App\Actions\Suppliers;

use App\Models\Supplier;

class UpdateSupplierAction
{
    public function execute(Supplier $supplier, array $supplierData): Supplier
    {
        $supplierData['display_name'] = $this->normalizeDisplayName($supplierData);

        $supplier->update($supplierData);

        return $supplier;
    }

    private function normalizeDisplayName(array $supplierData): string
    {
        $displayName = trim((string) ($supplierData['display_name'] ?? ''));
        $companyName = trim((string) ($supplierData['company_name'] ?? ''));

        return $displayName !== '' ? $displayName : $companyName;
    }
}
