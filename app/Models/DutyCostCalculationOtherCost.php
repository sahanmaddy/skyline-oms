<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DutyCostCalculationOtherCost extends Model
{
    protected $fillable = [
        'duty_cost_calculation_id',
        'cost_name',
        'amount_lkr',
        'remarks',
        'sort_order',
    ];

    protected $casts = [
        'amount_lkr' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function calculation(): BelongsTo
    {
        return $this->belongsTo(DutyCostCalculation::class, 'duty_cost_calculation_id');
    }
}

