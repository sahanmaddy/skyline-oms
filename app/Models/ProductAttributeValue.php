<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAttributeValue extends Model
{
    protected $fillable = [
        'product_attribute_type_id',
        'code',
        'value',
        'display_value',
        'description',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function attributeType(): BelongsTo
    {
        return $this->belongsTo(ProductAttributeType::class, 'product_attribute_type_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        $table = $query->getModel()->getTable();

        if ($query->getQuery()->columns === null) {
            $query->select("{$table}.*");
        }

        return $query
            ->leftJoin('product_attribute_types', "{$table}.product_attribute_type_id", '=', 'product_attribute_types.id')
            ->orderByRaw('product_attribute_types.sort_order IS NULL, product_attribute_types.sort_order ASC')
            ->orderBy('product_attribute_types.name')
            ->orderByRaw("{$table}.sort_order IS NULL, {$table}.sort_order ASC")
            ->orderBy("{$table}.value");
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('code', 'like', "%{$term}%")
                ->orWhere('value', 'like', "%{$term}%")
                ->orWhere('display_value', 'like', "%{$term}%");
        });
    }

    public function scopeForType(Builder $query, ?int $typeId): Builder
    {
        if ($typeId === null || $typeId === 0) {
            return $query;
        }

        return $query->where('product_attribute_type_id', $typeId);
    }
}
