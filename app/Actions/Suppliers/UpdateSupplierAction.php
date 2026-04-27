<?php

namespace App\Actions\Suppliers;

use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class UpdateSupplierAction
{
    public function execute(Supplier $supplier, array $supplierData): Supplier
    {
        return DB::transaction(function () use ($supplier, $supplierData) {
            $bankAccounts = $supplierData['bank_accounts'] ?? [];
            unset($supplierData['bank_accounts']);

            $supplierData['display_name'] = $this->normalizeDisplayName($supplierData);
            $supplier->update($supplierData);
            $supplier->bankAccounts()->delete();
            $supplier->bankAccounts()->createMany($this->normalizeBankRows($bankAccounts));

            return $supplier;
        });
    }

    private function normalizeDisplayName(array $supplierData): string
    {
        $displayName = trim((string) ($supplierData['display_name'] ?? ''));
        $companyName = trim((string) ($supplierData['company_name'] ?? ''));

        return $displayName !== '' ? $displayName : $companyName;
    }

    private function normalizeBankRows(array $rows): array
    {
        $normalized = collect($rows)
            ->filter(fn ($r) => is_array($r))
            ->values()
            ->map(function (array $r, int $index) {
                return [
                    'bank_name' => trim((string) ($r['bank_name'] ?? '')),
                    'branch_name' => ($v = trim((string) ($r['branch_name'] ?? ''))) !== '' ? $v : null,
                    'account_number' => trim((string) ($r['account_number'] ?? '')),
                    'account_name' => ($v = trim((string) ($r['account_name'] ?? ''))) !== '' ? $v : null,
                    'swift_bic_code' => ($v = trim((string) ($r['swift_bic_code'] ?? ''))) !== '' ? $v : null,
                    'display_order' => (int) ($r['display_order'] ?? $index),
                    'is_primary' => (bool) ($r['is_primary'] ?? false),
                ];
            })
            ->filter(fn (array $r) => $r['bank_name'] !== '' && $r['account_number'] !== '')
            ->values();

        if ($normalized->isEmpty()) {
            return [];
        }

        if (! $normalized->contains(fn (array $r) => $r['is_primary'] === true)) {
            $first = $normalized->first();
            $first['is_primary'] = true;
            $normalized[0] = $first;
        }

        return $normalized->all();
    }
}
