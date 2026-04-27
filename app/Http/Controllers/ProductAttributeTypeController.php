<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductAttributeTypeStoreRequest;
use App\Http\Requests\ProductAttributeTypeUpdateRequest;
use App\Models\ProductAttributeType;
use App\Services\Inventory\InventoryCodeGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductAttributeTypeController extends Controller
{
    public function create(): Response
    {
        $this->authorize('create', ProductAttributeType::class);

        return Inertia::render('Modules/Inventory/Pages/Attributes/TypeCreate');
    }

    public function store(ProductAttributeTypeStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $slug = $this->makeUniqueSlug($data['name']);

        $type = DB::transaction(function () use ($data, $slug) {
            $code = app(InventoryCodeGeneratorService::class)->nextSequentialCode(
                'product_attribute_types',
                'code',
                'ATTR-',
                0,
            );

            return ProductAttributeType::query()->create([
                ...$data,
                'code' => $code,
                'slug' => $slug,
            ]);
        });

        return redirect()
            ->route('inventory.attributes.index')
            ->with('success', 'Attribute type created.');
    }

    public function edit(ProductAttributeType $productAttributeType): Response
    {
        $this->authorize('update', $productAttributeType);

        return Inertia::render('Modules/Inventory/Pages/Attributes/TypeEdit', [
            'attributeType' => $productAttributeType,
        ]);
    }

    public function update(ProductAttributeTypeUpdateRequest $request, ProductAttributeType $productAttributeType): RedirectResponse
    {
        $data = $request->validated();
        if ($productAttributeType->name !== $data['name']) {
            $data['slug'] = $this->makeUniqueSlug($data['name'], $productAttributeType->id);
        }

        $productAttributeType->update($data);

        return redirect()
            ->route('inventory.attributes.index')
            ->with('success', 'Attribute type updated.');
    }

    public function destroy(ProductAttributeType $productAttributeType): RedirectResponse
    {
        $this->authorize('delete', $productAttributeType);

        if ($productAttributeType->values()->exists()) {
            return redirect()
                ->route('inventory.attributes.index')
                ->with('error', 'Remove all values for this type before deleting it.');
        }

        $productAttributeType->delete();

        return redirect()
            ->route('inventory.attributes.index')
            ->with('success', 'Attribute type deleted.');
    }

    private function makeUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'attribute';
        }

        $slug = $base;
        $i = 1;
        while (ProductAttributeType::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
