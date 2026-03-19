<?php

namespace App\Services\EmployeeDocuments;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeDocumentStorageService
{
    public function store(
        Employee $employee,
        UploadedFile $file,
        string $documentType,
        ?int $ignoreDocumentId = null
    ): array {
        $uuid = (string) Str::uuid();
        $fileName = $this->generateFileName($employee, $file, $documentType, $ignoreDocumentId);

        $path = $this->baseDir($employee)."/{$uuid}/{$fileName}";

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
        Employee $employee,
        UploadedFile $file,
        string $documentType,
        ?int $ignoreDocumentId = null
    ): array {
        if ($existingPath) {
            Storage::disk('local')->delete($existingPath);
        }

        return $this->store($employee, $file, $documentType, $ignoreDocumentId);
    }

    public function delete(string $path): void
    {
        if (! $path) {
            return;
        }

        Storage::disk('local')->delete($path);
    }

    private function baseDir(Employee $employee): string
    {
        return "employees/{$employee->id}/documents";
    }

    private function generateFileName(
        Employee $employee,
        UploadedFile $file,
        string $documentType,
        ?int $ignoreDocumentId = null
    ): string {
        $extension = strtolower(trim((string) $file->getClientOriginalExtension()));
        $extension = $extension !== '' ? $extension : 'bin';

        $employeeCode = trim((string) $employee->employee_code);
        $employeeCode = $employeeCode !== '' ? $employeeCode : ('EMP-' . $employee->id);

        $docTypePart = $this->normalizeDocumentTypeForFilename($documentType);
        $uploadDate = Carbon::now()->format('Y-m-d');

        // Safe filename base: {employee_code}-{document_type_normalized}-{YYYY-MM-DD}
        $base = "{$employeeCode}-{$docTypePart}-{$uploadDate}";

        $existsQuery = EmployeeDocument::query()
            ->where('employee_id', $employee->id)
            ->when($ignoreDocumentId !== null, fn ($q) => $q->where('id', '!=', $ignoreDocumentId));

        $candidate = "{$base}.{$extension}";
        if (! (clone $existsQuery)->where('file_name', $candidate)->exists()) {
            return $candidate;
        }

        // Duplicates: "{base} (1).ext", "{base} (2).ext", ...
        for ($i = 1; $i <= 99; $i++) {
            $candidate = "{$base} ({$i}).{$extension}";

            $exists = (clone $existsQuery)->where('file_name', $candidate)->exists();
            if (! $exists) {
                return $candidate;
            }
        }

        // Extremely unlikely fallback (avoid infinite loops).
        return "{$base}-" . Str::random(6) . ".{$extension}";
    }

    private function normalizeDocumentTypeForFilename(string $documentType): string
    {
        $normalized = trim($documentType);

        // Treat spaces as separators for filenames.
        $normalized = str_replace(['_', '/', '\\'], '-', $normalized);
        $normalized = preg_replace('/\s+/', '-', $normalized) ?? $normalized;

        // Remove unsafe characters while keeping hyphens + alphanumerics.
        $normalized = preg_replace('/[^A-Za-z0-9-]/', '', $normalized) ?? $normalized;

        // Collapse multiple hyphens.
        $normalized = preg_replace('/-+/', '-', $normalized) ?? $normalized;

        return $normalized !== '' ? $normalized : 'Document';
    }
}
