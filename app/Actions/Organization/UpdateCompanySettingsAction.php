<?php

namespace App\Actions\Organization;

use App\Models\CompanySetting;
use App\Models\User;
use App\Services\Organization\CompanySettingsPresenter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UpdateCompanySettingsAction
{
    public function __construct(private readonly CompanySettingsPresenter $presenter) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public function execute(CompanySetting $setting, array $validated, ?UploadedFile $siteIcon, bool $removeSiteIcon, User $actor): void
    {
        DB::transaction(function () use ($setting, $validated, $siteIcon, $removeSiteIcon, $actor): void {
            if ($removeSiteIcon && $setting->site_icon_path) {
                Storage::disk('public')->delete($setting->site_icon_path);
                $setting->site_icon_path = null;
            }

            if ($siteIcon instanceof UploadedFile) {
                if ($setting->site_icon_path) {
                    Storage::disk('public')->delete($setting->site_icon_path);
                }
                $setting->site_icon_path = $siteIcon->store('company/icons', 'public');
            }

            $setting->fill([
                'company_name' => $validated['company_name'],
                'registered_address' => $validated['registered_address'],
                'company_email' => $validated['company_email'] ?? null,
                'tin_number' => $validated['tin_number'] ?? null,
                'vat_number' => $validated['vat_number'] ?? null,
                'time_zone' => $validated['time_zone'],
                'currency_code' => $validated['currency_code'],
                'currency_symbol' => $validated['currency_symbol'],
                'currency_format' => $validated['currency_format'] ?? null,
                'updated_by' => $actor->id,
            ]);

            if ($setting->created_by === null) {
                $setting->created_by = $actor->id;
            }

            $setting->save();

            $setting->phoneNumbers()->delete();
            $phones = $this->normalizePhoneRows($validated['phone_numbers'] ?? []);
            if ($phones->isNotEmpty()) {
                $setting->phoneNumbers()->createMany($phones->all());
            }

            $setting->bankAccounts()->delete();
            $banks = $this->normalizeBankRows($validated['bank_accounts'] ?? []);
            if ($banks->isNotEmpty()) {
                $setting->bankAccounts()->createMany($banks->all());
            }
        });

        $this->presenter->forgetCache();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function normalizePhoneRows(array $rows): Collection
    {
        return collect($rows)
            ->filter(fn ($r) => is_array($r))
            ->values()
            ->map(function (array $r, int $index) {
                return [
                    'phone_type' => (string) ($r['phone_type'] ?? 'Office'),
                    'phone_number' => trim((string) ($r['phone_number'] ?? '')),
                    'display_order' => (int) ($r['display_order'] ?? $index),
                    'is_primary' => (bool) ($r['is_primary'] ?? false),
                ];
            })
            ->filter(fn (array $r) => $r['phone_number'] !== '');
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function normalizeBankRows(array $rows): Collection
    {
        return collect($rows)
            ->filter(fn ($r) => is_array($r))
            ->values()
            ->map(function (array $r, int $index) {
                return [
                    'bank_name' => trim((string) ($r['bank_name'] ?? '')),
                    'branch_name' => ($v = trim((string) ($r['branch_name'] ?? ''))) !== '' ? $v : null,
                    'account_number' => trim((string) ($r['account_number'] ?? '')),
                    'account_name' => ($v = trim((string) ($r['account_name'] ?? ''))) !== '' ? $v : null,
                    'display_order' => (int) ($r['display_order'] ?? $index),
                    'is_primary' => (bool) ($r['is_primary'] ?? false),
                ];
            })
            ->filter(fn (array $r) => $r['bank_name'] !== '' && $r['account_number'] !== '');
    }
}
