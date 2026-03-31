<?php

namespace App\Services\CustomerDocuments;

use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerDocumentStorageService
{
    public function store(
        Customer $customer,
        UploadedFile $file,
        string $title,
        ?int $ignoreDocumentId = null
    ): array {
        $uuid = (string) Str::uuid();
        $fileName = $this->generateFileName($customer, $file, $title, $ignoreDocumentId);
        $path = $this->baseDir($customer)."/{$uuid}/{$fileName}";

        Storage::disk('local')->putFileAs(dirname($path), $file, basename($path));

        return [
            'file_name' => $fileName,
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?: $file->getMimeType() ?: 'application/octet-stream',
            'file_size' => $file->getSize() ?: 0,
        ];
    }

    public function replace(
        string $existingPath,
        Customer $customer,
        UploadedFile $file,
        string $title,
        ?int $ignoreDocumentId = null
    ): array {
        if ($existingPath) {
            Storage::disk('local')->delete($existingPath);
        }

        return $this->store($customer, $file, $title, $ignoreDocumentId);
    }

    public function delete(string $path): void
    {
        if (! $path) {
            return;
        }

        Storage::disk('local')->delete($path);
    }

    private function baseDir(Customer $customer): string
    {
        return "customers/{$customer->id}/documents";
    }

    private function generateFileName(
        Customer $customer,
        UploadedFile $file,
        string $title,
        ?int $ignoreDocumentId = null
    ): string {
        $extension = strtolower(trim((string) $file->getClientOriginalExtension()));
        $extension = $extension !== '' ? $extension : 'bin';

        $safeTitle = $this->slugifyTitle($title);
        $base = $safeTitle !== '' ? $safeTitle : 'document';

        $existsQuery = CustomerDocument::query()
            ->where('customer_id', $customer->id)
            ->when($ignoreDocumentId !== null, fn ($q) => $q->where('id', '!=', $ignoreDocumentId));

        $candidate = "{$base}.{$extension}";
        if (! (clone $existsQuery)->where('file_name', $candidate)->exists()) {
            return $candidate;
        }

        for ($i = 1; $i <= 99; $i++) {
            $candidate = "{$base} ({$i}).{$extension}";
            if (! (clone $existsQuery)->where('file_name', $candidate)->exists()) {
                return $candidate;
            }
        }

        return "{$base}-".Str::random(6).".{$extension}";
    }

    private function slugifyTitle(string $title): string
    {
        $normalized = trim($title);
        if ($normalized === '') {
            return '';
        }

        $normalized = str_replace(['/', '\\'], '-', $normalized);
        $normalized = preg_replace('/\s+/', '-', $normalized) ?? $normalized;
        $normalized = preg_replace('/[^A-Za-z0-9\-\(\)]/', '', $normalized) ?? $normalized;
        $normalized = preg_replace('/-+/', '-', $normalized) ?? $normalized;

        return trim($normalized, '-');
    }
}

