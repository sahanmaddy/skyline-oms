<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class UnitOfMeasure extends Model
{
    protected $table = 'unit_of_measures';

    protected $fillable = [
        'unit_code',
        'name',
        'symbol',
        'decimal_precision',
        'allow_decimal',
        'is_base_unit',
        'is_system',
        'status',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'decimal_precision' => 'integer',
            'allow_decimal' => 'boolean',
            'is_base_unit' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        $driver = $query->getConnection()->getDriverName();

        $numericSuffix = match ($driver) {
            'sqlite' => 'cast(substr(unit_code, 5) as integer)',
            'pgsql' => 'cast(substring(unit_code from 5) as integer)',
            default => 'cast(substring(unit_code, 5) as unsigned)',
        };

        return $query
            ->orderByRaw("{$numericSuffix} asc")
            ->orderBy('unit_code');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('unit_code', 'like', "%{$term}%")
                ->orWhere('name', 'like', "%{$term}%")
                ->orWhere('symbol', 'like', "%{$term}%");
        });
    }

    /**
     * @todo Extend when purchase orders, GRN, products, etc. reference unit_of_measure_id
     */
    public function isReferenced(): bool
    {
        $checks = [
            'products',
            'purchase_order_lines',
            'grn_lines',
            'sales_order_lines',
            'inventory_transaction_lines',
        ];

        foreach ($checks as $table) {
            if (! \Illuminate\Support\Facades\Schema::hasTable($table)) {
                continue;
            }
            if (\Illuminate\Support\Facades\Schema::hasColumn($table, 'unit_of_measure_id')
                && \Illuminate\Support\Facades\DB::table($table)->where('unit_of_measure_id', $this->id)->exists()) {
                return true;
            }
        }

        return false;
    }
}
