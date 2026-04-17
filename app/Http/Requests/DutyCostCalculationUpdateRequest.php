<?php

namespace App\Http\Requests;

use App\Models\DutyCostCalculation;

class DutyCostCalculationUpdateRequest extends DutyCostCalculationStoreRequest
{
    public function authorize(): bool
    {
        $calculation = $this->route('duty_cost_calculation');

        return $calculation instanceof DutyCostCalculation
            ? ($this->user()?->can('update', $calculation) ?? false)
            : false;
    }
}
