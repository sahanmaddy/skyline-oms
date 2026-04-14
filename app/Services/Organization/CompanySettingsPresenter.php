<?php

namespace App\Services\Organization;

use App\Models\CompanySetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class CompanySettingsPresenter
{
    private const CACHE_KEY = 'inertia_company_shared_v1';

    public function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, mixed>
     */
    public function shared(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            if (! Schema::hasTable('company_settings')) {
                return $this->emptyPayload();
            }

            $row = CompanySetting::query()->with([
                'phoneNumbers' => fn ($q) => $q->orderBy('display_order')->orderBy('id'),
                'bankAccounts' => fn ($q) => $q->orderBy('display_order')->orderBy('id'),
            ])->orderBy('id')->first();

            if ($row === null) {
                return $this->emptyPayload();
            }

            return $this->fromModel($row);
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function forEditPage(CompanySetting $setting): array
    {
        $setting->loadMissing([
            'phoneNumbers' => fn ($q) => $q->orderBy('display_order')->orderBy('id'),
            'bankAccounts' => fn ($q) => $q->orderBy('display_order')->orderBy('id'),
        ]);

        return $this->fromModel($setting);
    }

    /**
     * @return array<string, mixed>
     */
    private function fromModel(CompanySetting $row): array
    {
        $iconUrl = null;
        if ($row->site_icon_path && Storage::disk('public')->exists($row->site_icon_path)) {
            $iconUrl = Storage::disk('public')->url($row->site_icon_path);
        }

        $primaryPhone = $row->phoneNumbers->firstWhere('is_primary', true)
            ?? $row->phoneNumbers->first();

        return [
            'id' => (int) $row->id,
            'name' => $row->company_name,
            'registered_address' => $row->registered_address,
            'email' => $row->company_email,
            'tin_number' => $row->tin_number,
            'vat_number' => $row->vat_number,
            'site_icon_url' => $iconUrl,
            'site_icon_path' => $row->site_icon_path,
            'time_zone' => $row->time_zone,
            'currency_code' => $row->currency_code,
            'currency_symbol' => $row->currency_symbol,
            'currency_format' => $row->currency_format,
            'primary_phone' => $primaryPhone
                ? trim($primaryPhone->phone_type.': '.$primaryPhone->phone_number)
                : null,
            'phone_numbers' => $row->phoneNumbers->map(fn ($p) => [
                'id' => $p->id,
                'phone_type' => $p->phone_type,
                'phone_number' => $p->phone_number,
                'display_order' => (int) $p->display_order,
                'is_primary' => (bool) $p->is_primary,
            ])->values()->all(),
            'bank_accounts' => $row->bankAccounts->map(fn ($b) => [
                'id' => $b->id,
                'bank_name' => $b->bank_name,
                'branch_name' => $b->branch_name,
                'account_number' => $b->account_number,
                'account_name' => $b->account_name,
                'display_order' => (int) $b->display_order,
                'is_primary' => (bool) $b->is_primary,
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyPayload(): array
    {
        return [
            'id' => null,
            'name' => config('app.name', 'Skyline OMS'),
            'registered_address' => '',
            'email' => null,
            'tin_number' => null,
            'vat_number' => null,
            'site_icon_url' => null,
            'site_icon_path' => null,
            'time_zone' => config('app.timezone', 'UTC'),
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'currency_format' => '{symbol} {amount}',
            'primary_phone' => null,
            'phone_numbers' => [],
            'bank_accounts' => [],
        ];
    }
}
