<?php

namespace App\Http\Controllers;

use App\Http\Requests\UnitOfMeasureStoreRequest;
use App\Http\Requests\UnitOfMeasureUpdateRequest;
use App\Models\UnitOfMeasure;
use App\Services\Inventory\InventoryCodeGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UnitOfMeasureController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(UnitOfMeasure::class, 'unit_of_measure');
    }

    public function index(Request $request): Response
    {
        $query = UnitOfMeasure::query()->ordered();

        if ($search = trim((string) $request->string('q'))) {
            $query->search($search);
        }

        if (($status = $request->string('status')->toString()) !== '') {
            if (in_array($status, ['active', 'inactive'], true)) {
                $query->where('status', $status);
            }
        }

        $units = $query
            ->paginate(15)
            ->withQueryString()
            ->through(fn (UnitOfMeasure $u) => [
                ...$u->toArray(),
                'can_view' => $request->user()?->can('view', $u) ?? false,
                'can_edit' => $request->user()?->can('update', $u) ?? false,
                'can_delete' => ($request->user()?->can('delete', $u) ?? false)
                    && ! $u->is_system
                    && ! $u->isReferenced(),
            ]);

        return Inertia::render('Modules/Inventory/Pages/Units/Index', [
            'units' => $units,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => ['active', 'inactive'],
            'canCreate' => $request->user()?->can('create', UnitOfMeasure::class) ?? false,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Inventory/Pages/Units/Create');
    }

    public function store(UnitOfMeasureStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_base_unit'] = $request->boolean('is_base_unit');
        $data['is_system'] = false;

        $unit = DB::transaction(function () use ($data) {
            $code = app(InventoryCodeGeneratorService::class)->nextSequentialCode(
                'unit_of_measures',
                'unit_code',
                'UOM-',
                0,
            );

            return UnitOfMeasure::query()->create([
                ...$data,
                'unit_code' => $code,
            ]);
        });

        return redirect()
            ->route('inventory.units.show', $unit)
            ->with('success', 'Unit of measure created.');
    }

    public function show(UnitOfMeasure $unitOfMeasure): Response
    {
        return Inertia::render('Modules/Inventory/Pages/Units/Show', [
            'unit' => $unitOfMeasure,
            'canEdit' => request()->user()?->can('update', $unitOfMeasure) ?? false,
            'canDelete' => (request()->user()?->can('delete', $unitOfMeasure) ?? false)
                && ! $unitOfMeasure->is_system
                && ! $unitOfMeasure->isReferenced(),
        ]);
    }

    public function edit(UnitOfMeasure $unitOfMeasure): Response
    {
        return Inertia::render('Modules/Inventory/Pages/Units/Edit', [
            'unit' => $unitOfMeasure,
        ]);
    }

    public function update(UnitOfMeasureUpdateRequest $request, UnitOfMeasure $unitOfMeasure): RedirectResponse
    {
        $data = $request->validated();
        $data['is_base_unit'] = $request->boolean('is_base_unit');

        $unitOfMeasure->update($data);

        return redirect()
            ->route('inventory.units.show', $unitOfMeasure)
            ->with('success', 'Unit of measure updated.');
    }

    public function destroy(UnitOfMeasure $unitOfMeasure): RedirectResponse
    {
        if ($unitOfMeasure->is_system) {
            return redirect()
                ->route('inventory.units.index')
                ->with('error', 'System units cannot be deleted.');
        }

        if ($unitOfMeasure->isReferenced()) {
            return redirect()
                ->route('inventory.units.index')
                ->with('error', 'This unit is in use and cannot be deleted.');
        }

        $unitOfMeasure->delete();

        return redirect()
            ->route('inventory.units.index')
            ->with('success', 'Unit of measure deleted.');
    }
}
