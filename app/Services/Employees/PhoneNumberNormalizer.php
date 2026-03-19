<?php

namespace App\Services\Employees;

class PhoneNumberNormalizer
{
    public function normalize(?string $countryCode, ?string $input): ?string
    {
        $raw = trim((string) $input);

        if ($raw === '') {
            return null;
        }

        $phoneDigits = preg_replace('/\D+/', '', $raw) ?? '';
        if ($phoneDigits === '') {
            return null;
        }

        $ccDigits = preg_replace('/\D+/', '', (string) $countryCode) ?? '';
        if ($ccDigits !== '' && str_starts_with($phoneDigits, $ccDigits)) {
            $phoneDigits = substr($phoneDigits, strlen($ccDigits));
        }

        $phoneDigits = ltrim($phoneDigits, '0');

        return $phoneDigits !== '' ? $phoneDigits : null;
    }
}
