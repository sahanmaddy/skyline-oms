<?php

namespace App\Http\Requests;

use App\Enums\CustomerDocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerDocumentReplaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var \App\Models\CustomerDocument|null $document */
        $document = $this->route('document');

        return $document ? ($this->user()?->can('update', $document) ?? false) : false;
    }

    public function rules(): array
    {
        return [
            'document_type' => ['sometimes', 'string', Rule::in(CustomerDocumentType::values())],
            'title' => ['sometimes', 'string', 'max:200'],
            'file' => ['required', 'file', 'max:20480'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

