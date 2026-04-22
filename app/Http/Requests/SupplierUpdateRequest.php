<?php

namespace App\Http\Requests;

use App\Models\Supplier;

class SupplierUpdateRequest extends SupplierStoreRequest
{
    public function authorize(): bool
    {
        $supplier = $this->route('supplier');

        return $supplier instanceof Supplier
            ? ($this->user()?->can('update', $supplier) ?? false)
            : false;
    }
}
