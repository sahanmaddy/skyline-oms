<?php

namespace App\Http\Requests;

use App\Models\DutyCostCalculation;
use Illuminate\Foundation\Http\FormRequest;

class DutyCostCalculationUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $calculation = $this->route('duty_cost_calculation');

        return $calculation instanceof DutyCostCalculation
            ? ($this->user()?->can('update', $calculation) ?? false)
            : false;
    }

    public function rules(): array
    {
        return (new DutyCostCalculationStoreRequest())->rules();
    }

    public function withValidator($validator): void
    {
        (new DutyCostCalculationStoreRequest())->withValidator($validator);
    }
}

