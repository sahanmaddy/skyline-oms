<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductAttributeValueStoreRequest;
use App\Http\Requests\ProductAttributeValueUpdateRequest;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Services\Inventory\InventoryCodeGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductAttributeValueController extends Controller
{
    public function create(\Illuminate\Http\Request $request): Response
    {
        $this->authorize('create', ProductAttributeValue::class);

        $typeId = $request->integer('type_id');

        return Inertia::render('Modules/Inventory/Pages/Attributes/ValueCreate', [
            'typeOptions' => ProductAttributeType::query()->ordered()->get(['id', 'name', 'code']),
            'prefillTypeId' => $typeId > 0 ? $typeId : null,
        ]);
    }

    public function store(ProductAttributeValueStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $display = trim((string) ($data['display_value'] ?? ''));
        $data['display_value'] = $display !== '' ? $display : null;

        DB::transaction(function () use ($data) {
            $code = app(InventoryCodeGeneratorService::class)->nextSequentialCode(
                'product_attribute_values',
                'code',
                'ATTRV-',
                0,
            );

            ProductAttributeValue::query()->create([
                ...$data,
                'code' => $code,
            ]);
        });

        return redirect()
            ->route('inventory.attributes.index')
            ->with('success', 'Attribute value created.');
    }

    public function edit(ProductAttributeValue $productAttributeValue): Response
    {
        $this->authorize('update', $productAttributeValue);
        $productAttributeValue->load('attributeType:id,name,code');

        return Inertia::render('Modules/Inventory/Pages/Attributes/ValueEdit', [
            'attributeValue' => $productAttributeValue,
            'typeOptions' => ProductAttributeType::query()->ordered()->get(['id', 'name', 'code']),
        ]);
    }

    public function update(ProductAttributeValueUpdateRequest $request, ProductAttributeValue $productAttributeValue): RedirectResponse
    {
        $data = $request->validated();
        $display = trim((string) ($data['display_value'] ?? ''));
        $data['display_value'] = $display !== '' ? $display : null;

        $productAttributeValue->update($data);

        return redirect()
            ->route('inventory.attributes.index')
            ->with('success', 'Attribute value updated.');
    }

    public function destroy(ProductAttributeValue $productAttributeValue): RedirectResponse
    {
        $this->authorize('delete', $productAttributeValue);

        $productAttributeValue->delete();

        return redirect()
            ->route('inventory.attributes.index')
            ->with('success', 'Attribute value deleted.');
    }
}
