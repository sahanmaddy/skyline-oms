<?php

namespace App\Http\Requests;

use App\Enums\CustomerDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerDocumentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\CustomerDocument::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', 'string', Rule::in(CustomerDocumentType::values())],
            'title' => ['required', 'string', 'max:200'],
            'file' => ['required', 'file', 'max:20480'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

