<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    protected $fillable = [
        'category_code',
        'name',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('name');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('category_code', 'like', "%{$term}%")
                ->orWhere('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('status', 'like', "%{$term}%");
        });
    }

    /**
     * @todo When products exist: return $this->hasMany(Product::class);
     */
    public function isReferencedByProducts(): bool
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('products')) {
            return false;
        }

        return \Illuminate\Support\Facades\DB::table('products')
            ->where('product_category_id', $this->id)
            ->exists();
    }
}
