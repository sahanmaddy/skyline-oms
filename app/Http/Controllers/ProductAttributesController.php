<?php

namespace App\Http\Controllers;

use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductAttributesController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ProductAttributeType::class);

        $typeQuery = ProductAttributeType::query()
            ->withCount('values')
            ->ordered();

        if ($tSearch = trim((string) $request->string('type_q'))) {
            $typeQuery->search($tSearch);
        }

        if (($tStatus = $request->string('type_status')->toString()) !== '') {
            if (in_array($tStatus, ['active', 'inactive'], true)) {
                $typeQuery->where('status', $tStatus);
            }
        }

        $attributeTypes = $typeQuery
            ->paginate(10, ['*'], 'types_page')
            ->withQueryString()
            ->through(fn (ProductAttributeType $t) => [
                ...$t->toArray(),
                'can_view' => $request->user()?->can('view', $t) ?? false,
                'can_edit' => $request->user()?->can('update', $t) ?? false,
                'can_delete' => ($request->user()?->can('delete', $t) ?? false) && $t->values_count === 0,
            ]);

        $valueQuery = ProductAttributeValue::query()
            ->with('attributeType:id,name,code')
            ->ordered();

        if ($vSearch = trim((string) $request->string('value_q'))) {
            $valueQuery->search($vSearch);
        }

        if (($vStatus = $request->string('value_status')->toString()) !== '') {
            if (in_array($vStatus, ['active', 'inactive'], true)) {
                $valueQuery->where('status', $vStatus);
            }
        }

        $typeFilter = $request->integer('value_type_id');
        if ($typeFilter > 0) {
            $valueQuery->forType($typeFilter);
        }

        $attributeValues = $valueQuery
            ->paginate(15, ['*'], 'values_page')
            ->withQueryString()
            ->through(fn (ProductAttributeValue $v) => [
                ...$v->toArray(),
                'can_view' => $request->user()?->can('view', $v) ?? false,
                'can_edit' => $request->user()?->can('update', $v) ?? false,
                'can_delete' => $request->user()?->can('delete', $v) ?? false,
            ]);

        $typeOptions = ProductAttributeType::query()->ordered()->get(['id', 'name', 'code']);

        return Inertia::render('Modules/Inventory/Pages/Attributes/Index', [
            'attributeTypes' => $attributeTypes,
            'attributeValues' => $attributeValues,
            'typeOptions' => $typeOptions,
            'filters' => [
                'type_q' => $request->string('type_q')->toString(),
                'type_status' => $request->string('type_status')->toString(),
                'value_q' => $request->string('value_q')->toString(),
                'value_status' => $request->string('value_status')->toString(),
                'value_type_id' => $typeFilter > 0 ? (string) $typeFilter : '',
            ],
            'statusOptions' => ['active', 'inactive'],
            'canCreateType' => $request->user()?->can('create', ProductAttributeType::class) ?? false,
            'canCreateValue' => $request->user()?->can('create', ProductAttributeValue::class) ?? false,
        ]);
    }
}
