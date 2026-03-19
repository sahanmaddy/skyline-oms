<?php

namespace App\Http\Requests;

use App\Enums\EmployeeDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeDocumentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\EmployeeDocument::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', 'string', Rule::in(EmployeeDocumentType::values())],
            'title' => ['required', 'string', 'max:200'],
            'file' => ['required', 'file', 'max:20480'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
