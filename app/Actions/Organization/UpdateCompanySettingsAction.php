<?php

namespace App\Actions\Organization;

use App\Models\CompanySetting;
use App\Models\User;
use App\Services\Organization\CompanySettingsPresenter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
                $setting->site_icon_path = $this->storeSquareIcon($siteIcon);
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
                $countryCode = (string) ($r['country_code'] ?? '+94');
                $normalized = $this->phoneNumberNormalizer->normalize(
                    $countryCode,
                    (string) ($r['phone_number'] ?? ''),
                );

                return [
                    'phone_type' => (string) ($r['phone_type'] ?? 'Office'),
                    'country_code' => $countryCode,
                    'country_iso2' => $this->normalizeCountryIso2($r['country_iso2'] ?? null),
                    'phone_number' => $normalized ?? '',
                    'display_order' => (int) ($r['display_order'] ?? $index),
                    'is_primary' => (bool) ($r['is_primary'] ?? false),
                ];
            })
            ->filter(fn (array $r) => $r['phone_number'] !== '');
    }

    private function normalizeCountryIso2(mixed $value): ?string
    {
        if (! is_string($value) || strlen($value) !== 2) {
            return null;
        }

        return ctype_alpha($value) ? strtoupper($value) : null;
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

    private function storeSquareIcon(UploadedFile $siteIcon): string
    {
        $contents = @file_get_contents($siteIcon->getRealPath());
        if ($contents === false) {
            return $siteIcon->store('company/icons', 'public');
        }

        $source = @imagecreatefromstring($contents);
        if (! $source) {
            return $siteIcon->store('company/icons', 'public');
        }

        try {
            $srcWidth = imagesx($source);
            $srcHeight = imagesy($source);
            $size = min($srcWidth, $srcHeight);
            $srcX = (int) floor(($srcWidth - $size) / 2);
            $srcY = (int) floor(($srcHeight - $size) / 2);

            $square = imagecreatetruecolor($size, $size);
            if ($square === false) {
                return $siteIcon->store('company/icons', 'public');
            }

            imagealphablending($square, false);
            imagesavealpha($square, true);
            $transparent = imagecolorallocatealpha($square, 0, 0, 0, 127);
            imagefilledrectangle($square, 0, 0, $size, $size, $transparent);
            imagecopyresampled($square, $source, 0, 0, $srcX, $srcY, $size, $size, $size, $size);

            $filename = 'company/icons/'.Str::uuid().'.png';
            $radius = max(14, (int) round($size * 0.22));
            $radius = min($radius, (int) floor($size / 2));

            // Apply rounded corners with transparent edges.
            for ($x = 0; $x < $size; $x++) {
                for ($y = 0; $y < $size; $y++) {
                    $inCornerX = $x < $radius || $x >= $size - $radius;
                    $inCornerY = $y < $radius || $y >= $size - $radius;
                    if (! $inCornerX || ! $inCornerY) {
                        continue;
                    }

                    $cx = $x < $radius ? $radius - 1 : $size - $radius;
                    $cy = $y < $radius ? $radius - 1 : $size - $radius;
                    $dx = $x - $cx;
                    $dy = $y - $cy;
                    if (($dx * $dx) + ($dy * $dy) > (($radius - 1) * ($radius - 1))) {
                        imagesetpixel($square, $x, $y, $transparent);
                    }
                }
            }

            ob_start();
            $written = imagepng($square, null, 6);
            $binary = ob_get_clean();

            imagedestroy($square);

            if (! $written || ! is_string($binary) || $binary === '') {
                return $siteIcon->store('company/icons', 'public');
            }

            Storage::disk('public')->put($filename, $binary);

            return $filename;
        } finally {
            imagedestroy($source);
        }
    }
}
