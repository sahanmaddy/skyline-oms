<?php

namespace App\Services\EmployeeDocuments;

use App\Models\Employee;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeDocumentStorageService
{
    public function store(Employee $employee, UploadedFile $file): array
    {
        $uuid = (string) Str::uuid();
        $safeName = $this->safeFileName($file->getClientOriginalName());

        $path = $this->baseDir($employee)."/{$uuid}/{$safeName}";

        Storage::disk('local')->putFileAs(dirname($path), $file, basename($path));

        return [
            'file_name' => $safeName,
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?: $file->getMimeType() ?: 'application/octet-stream',
            'file_size' => $file->getSize() ?: 0,
        ];
    }

    public function replace(string $existingPath, Employee $employee, UploadedFile $file): array
    {
        if ($existingPath) {
            Storage::disk('local')->delete($existingPath);
        }

        return $this->store($employee, $file);
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

    private function safeFileName(string $originalName): string
    {
        $name = trim($originalName);

        if ($name === '') {
            return 'document';
        }

        $name = str_replace(['\\', '/', "\0"], '-', $name);

        return $name;
    }
}
