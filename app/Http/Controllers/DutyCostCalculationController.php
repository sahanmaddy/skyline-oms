<?php

namespace App\Http\Controllers;

use App\Http\Requests\DutyCostCalculationStoreRequest;
use App\Http\Requests\DutyCostCalculationUpdateRequest;
use App\Models\DutyCostCalculation;
use App\Services\Procurement\DutyCostCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DutyCostCalculationController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(DutyCostCalculation::class, 'duty_cost_calculation');
    }

    public function index(Request $request): Response
    {
        $query = DutyCostCalculation::query()
            ->with(['creator:id,name'])
            ->latest('id');

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('calculation_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('supplier_name', 'like', "%{$search}%");
            });
        }

        if ($status = trim((string) $request->string('status'))) {
            $query->where('calculation_status', $status);
        }

        if ($dateFrom = trim((string) $request->string('date_from'))) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = trim((string) $request->string('date_to'))) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $rows = $query->paginate(15)->withQueryString()->through(
            fn (DutyCostCalculation $row) => [
                'id' => $row->id,
                'calculation_code' => $row->calculation_code,
                'title' => $row->title,
                'item_count' => $row->item_count,
                'total_weight_kg' => (float) $row->total_weight_kg,
                'total_cbm' => (float) $row->total_cbm,
                'total_duty_lkr' => (float) $row->total_duty_lkr,
                'grand_total_landed_cost_lkr' => (float) $row->grand_total_landed_cost_lkr,
                'calculation_status' => $row->calculation_status,
                'created_by_name' => $row->creator?->name,
                'updated_at' => optional($row->updated_at)->toIso8601String(),
                'can_view' => $request->user()?->can('view', $row) ?? false,
                'can_edit' => $request->user()?->can('update', $row) ?? false,
                'can_delete' => $request->user()?->can('delete', $row) ?? false,
            ],
        );

        return Inertia::render('Modules/Procurement/DutyCostCalculator/Pages/Index', [
            'calculations' => $rows,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
            ],
            'statusOptions' => ['draft', 'finalized'],
            'canCreate' => $request->user()?->can('create', DutyCostCalculation::class) ?? false,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Procurement/DutyCostCalculator/Pages/Create', [
            'nextCode' => $this->nextCode(),
            'statusOptions' => ['draft', 'finalized'],
        ]);
    }

    public function store(DutyCostCalculationStoreRequest $request, DutyCostCalculationService $calculator): RedirectResponse
    {
        $payload = $request->validated();
        $computed = $calculator->calculate($payload);

        $row = DB::transaction(function () use ($payload, $computed, $request) {
            $main = DutyCostCalculation::create([
                'calculation_code' => $this->nextCode(),
                'title' => $payload['title'],
                'supplier_name' => $payload['supplier_name'] ?? null,
                'purchasing_currency' => $payload['purchasing_currency'],
                'local_currency' => $payload['local_currency'],
                'shipment_currency_basis_notes' => $payload['shipment_currency_basis_notes'] ?? null,
                'exchange_rate' => $payload['exchange_rate'],
                'freight_currency' => $payload['freight_currency'] ?? null,
                'freight_exchange_rate' => $payload['freight_exchange_rate'] ?? null,
                'total_shipment_cbm' => $payload['total_shipment_cbm'] ?? null,
                'freight_cost_total' => $payload['freight_cost_total'] ?? 0,
                'loading_cost_lkr' => $payload['loading_cost_lkr'] ?? 0,
                'unloading_cost_lkr' => $payload['unloading_cost_lkr'] ?? 0,
                'transport_cost_lkr' => $payload['transport_cost_lkr'] ?? 0,
                'delivery_order_charges_lkr' => $payload['delivery_order_charges_lkr'] ?? 0,
                'clearing_charges_lkr' => $payload['clearing_charges_lkr'] ?? 0,
                'demurrage_cost_lkr' => $payload['demurrage_cost_lkr'] ?? 0,
                'other_costs_lkr_total' => $computed['summary']['other_costs_lkr_total'],
                'notes' => $payload['notes'] ?? null,
                'calculation_status' => $payload['calculation_status'] ?? 'draft',
                'totals' => $computed['summary'],
                ...$this->summaryColumns($computed['summary']),
                'created_by' => $request->user()?->id,
                'updated_by' => $request->user()?->id,
            ]);

            $main->items()->createMany($computed['items']);
            $main->otherCosts()->createMany($computed['other_costs']);

            return $main;
        });

        return redirect()
            ->route('procurement.duty-cost-calculations.show', $row)
            ->with('success', 'Duty & cost calculation created.');
    }

    public function show(DutyCostCalculation $dutyCostCalculation): Response
    {
        $dutyCostCalculation->load([
            'items',
            'otherCosts',
            'creator:id,name',
            'updater:id,name',
        ]);

        return Inertia::render('Modules/Procurement/DutyCostCalculator/Pages/Show', [
            'calculation' => $dutyCostCalculation,
            'canEdit' => request()->user()?->can('update', $dutyCostCalculation) ?? false,
            'canDelete' => request()->user()?->can('delete', $dutyCostCalculation) ?? false,
            'canDuplicate' => request()->user()?->can('create', DutyCostCalculation::class) ?? false,
        ]);
    }

    public function edit(DutyCostCalculation $dutyCostCalculation): Response
    {
        $dutyCostCalculation->load(['items', 'otherCosts']);

        return Inertia::render('Modules/Procurement/DutyCostCalculator/Pages/Edit', [
            'calculation' => $dutyCostCalculation,
            'statusOptions' => ['draft', 'finalized'],
        ]);
    }

    public function update(
        DutyCostCalculationUpdateRequest $request,
        DutyCostCalculation $dutyCostCalculation,
        DutyCostCalculationService $calculator
    ): RedirectResponse {
        $payload = $request->validated();
        $computed = $calculator->calculate($payload);

        DB::transaction(function () use ($dutyCostCalculation, $payload, $computed, $request) {
            $dutyCostCalculation->update([
                'title' => $payload['title'],
                'supplier_name' => $payload['supplier_name'] ?? null,
                'purchasing_currency' => $payload['purchasing_currency'],
                'local_currency' => $payload['local_currency'],
                'shipment_currency_basis_notes' => $payload['shipment_currency_basis_notes'] ?? null,
                'exchange_rate' => $payload['exchange_rate'],
                'freight_currency' => $payload['freight_currency'] ?? null,
                'freight_exchange_rate' => $payload['freight_exchange_rate'] ?? null,
                'total_shipment_cbm' => $payload['total_shipment_cbm'] ?? null,
                'freight_cost_total' => $payload['freight_cost_total'] ?? 0,
                'loading_cost_lkr' => $payload['loading_cost_lkr'] ?? 0,
                'unloading_cost_lkr' => $payload['unloading_cost_lkr'] ?? 0,
                'transport_cost_lkr' => $payload['transport_cost_lkr'] ?? 0,
                'delivery_order_charges_lkr' => $payload['delivery_order_charges_lkr'] ?? 0,
                'clearing_charges_lkr' => $payload['clearing_charges_lkr'] ?? 0,
                'demurrage_cost_lkr' => $payload['demurrage_cost_lkr'] ?? 0,
                'other_costs_lkr_total' => $computed['summary']['other_costs_lkr_total'],
                'notes' => $payload['notes'] ?? null,
                'calculation_status' => $payload['calculation_status'] ?? 'draft',
                'totals' => $computed['summary'],
                ...$this->summaryColumns($computed['summary']),
                'updated_by' => $request->user()?->id,
            ]);

            $dutyCostCalculation->items()->delete();
            $dutyCostCalculation->otherCosts()->delete();
            $dutyCostCalculation->items()->createMany($computed['items']);
            $dutyCostCalculation->otherCosts()->createMany($computed['other_costs']);
        });

        return redirect()
            ->route('procurement.duty-cost-calculations.show', $dutyCostCalculation)
            ->with('success', 'Duty & cost calculation updated.');
    }

    public function destroy(DutyCostCalculation $dutyCostCalculation): RedirectResponse
    {
        $dutyCostCalculation->delete();

        return redirect()
            ->route('procurement.duty-cost-calculations.index')
            ->with('success', 'Duty & cost calculation deleted.');
    }

    public function duplicate(DutyCostCalculation $dutyCostCalculation): RedirectResponse
    {
        $this->authorize('create', DutyCostCalculation::class);
        $dutyCostCalculation->load(['items', 'otherCosts']);

        $new = DB::transaction(function () use ($dutyCostCalculation) {
            $copy = $dutyCostCalculation->replicate([
                'calculation_code',
                'created_at',
                'updated_at',
            ]);
            $copy->calculation_code = $this->nextCode();
            $copy->title = $dutyCostCalculation->title.' (Copy)';
            $copy->calculation_status = 'draft';
            $copy->created_by = auth()->id();
            $copy->updated_by = auth()->id();
            $copy->save();

            foreach ($dutyCostCalculation->items as $item) {
                $copy->items()->create($item->toArray());
            }
            foreach ($dutyCostCalculation->otherCosts as $cost) {
                $copy->otherCosts()->create($cost->toArray());
            }

            return $copy;
        });

        return redirect()
            ->route('procurement.duty-cost-calculations.edit', $new)
            ->with('success', 'Calculation duplicated. You can now adjust assumptions.');
    }

    private function nextCode(): string
    {
        $lastId = (int) DutyCostCalculation::query()->max('id');

        return 'DCC-'.($lastId + 1);
    }

    private function summaryColumns(array $summary): array
    {
        return [
            'item_count' => $summary['item_count'] ?? 0,
            'total_product_value_lkr' => $summary['total_product_value_lkr'] ?? 0,
            'total_statistical_value_lkr' => $summary['total_statistical_value_lkr'] ?? 0,
            'total_cid_lkr' => $summary['total_cid_lkr'] ?? 0,
            'total_vat_lkr' => $summary['total_vat_lkr'] ?? 0,
            'total_sscl_lkr' => $summary['total_sscl_lkr'] ?? 0,
            'total_duty_lkr' => $summary['total_duty_lkr'] ?? 0,
            'total_allocated_freight_lkr' => $summary['total_allocated_freight_lkr'] ?? 0,
            'total_allocated_other_costs_lkr' => $summary['total_allocated_other_costs_lkr'] ?? 0,
            'grand_total_landed_cost_lkr' => $summary['grand_total_landed_cost_lkr'] ?? 0,
            'total_weight_kg' => $summary['total_weight_kg'] ?? 0,
            'total_cbm' => $summary['total_cbm'] ?? 0,
            'freight_cost_per_cbm_lkr' => $summary['freight_cost_per_cbm_lkr'] ?? 0,
        ];
    }
}

