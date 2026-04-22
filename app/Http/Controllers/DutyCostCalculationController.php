<?php

namespace App\Http\Controllers;

use App\Http\Requests\DutyCostCalculationStoreRequest;
use App\Http\Requests\DutyCostCalculationUpdateRequest;
use App\Models\DutyCostCalculation;
use App\Models\Supplier;
use App\Services\Organization\CompanySettingsPresenter;
use App\Services\Procurement\DutyCostCalculationService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
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
        $query = DutyCostCalculation::query()->with('supplier')->latest('id');

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('calculation_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('supplier_name', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                        $supplierQuery->where('display_name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = trim((string) $request->string('status'))) {
            $query->where('calculation_status', $status);
        }

        $this->scopeUpdatedAtToFilterDates($query, $request);

        $rows = $query->paginate(15)->withQueryString()->through(
            function (DutyCostCalculation $row) use ($request): array {
                $purchaseLkr = round((float) ($row->total_product_value_lkr ?? 0), 2);
                $freightLkr = round((float) ($row->freight_cost_total ?? 0) * (float) ($row->freight_exchange_rate ?? 0), 2);
                $bankBaseLkr = round($purchaseLkr + $freightLkr, 2);
                $bankTransferLkr = $bankBaseLkr > 0 ? round($bankBaseLkr * 0.01, 2) : 0.0;
                $remittanceLkr = round($purchaseLkr + $freightLkr, 2);

                $totals = $row->totals;
                $bankInterestLkr = is_array($totals) ? (float) ($totals['bank_interest_lkr'] ?? 0) : 0.0;

                return [
                    'id' => $row->id,
                    'calculation_code' => $row->calculation_code,
                    'title' => $row->title,
                    'supplier_name' => $row->supplier?->display_name ?? $row->supplier_name,
                    'supplier_company_name' => $row->supplier?->company_name,
                    'item_count' => $row->item_count,
                    'remittance_lkr' => $remittanceLkr,
                    'bank_transfer_lkr' => $bankTransferLkr,
                    'total_allocated_other_costs_lkr' => (float) ($row->total_allocated_other_costs_lkr ?? 0),
                    'bank_interest_lkr' => $bankInterestLkr,
                    'total_weight_kg' => (float) $row->total_weight_kg,
                    'total_cbm' => (float) $row->total_cbm,
                    'total_duty_lkr' => (float) $row->total_duty_lkr,
                    'grand_total_landed_cost_lkr' => (float) $row->grand_total_landed_cost_lkr,
                    'calculation_status' => $row->calculation_status,
                    'updated_at' => optional($row->updated_at)->toIso8601String(),
                    'can_view' => $request->user()?->can('view', $row) ?? false,
                    'can_edit' => $request->user()?->can('update', $row) ?? false,
                    'can_delete' => $request->user()?->can('delete', $row) ?? false,
                ];
            },
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
            'suppliers' => $this->supplierOptions(),
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
                'supplier_id' => $payload['supplier_id'] ?? null,
                'supplier_name' => $payload['supplier_name'] ?? null,
                'purchasing_currency' => $payload['purchasing_currency'],
                'local_currency' => $payload['local_currency'],
                'shipment_currency_basis_notes' => $payload['shipment_currency_basis_notes'] ?? null,
                'exchange_rate' => $payload['exchange_rate'],
                'freight_currency' => $payload['freight_currency'] ?? null,
                'freight_exchange_rate' => $payload['freight_exchange_rate'] ?? null,
                'total_shipment_cbm' => $computed['summary']['total_cbm'] ?? 0,
                'freight_cost_total' => $payload['freight_cost_total'] ?? 0,
                'loading_unloading_cost_lkr' => $payload['loading_unloading_cost_lkr'] ?? 0,
                'transport_cost_lkr' => $payload['transport_cost_lkr'] ?? 0,
                'delivery_order_charges_lkr' => $payload['delivery_order_charges_lkr'] ?? 0,
                'clearing_charges_lkr' => $payload['clearing_charges_lkr'] ?? 0,
                'demurrage_cost_lkr' => $payload['demurrage_cost_lkr'] ?? 0,
                'additional_entry_cost_lkr' => $payload['additional_entry_cost_lkr'] ?? 0,
                'cid_rate_per_kg_lkr' => $payload['cid_rate_per_kg_lkr'] ?? 0,
                'cid_basis' => $payload['cid_basis'] ?? 'weight',
                'eid_rate_per_kg_lkr' => $payload['eid_rate_per_kg_lkr'] ?? 0,
                'eid_basis' => $payload['eid_basis'] ?? 'weight',
                'statistical_value_basis' => $payload['statistical_value_basis'] ?? 'weight',
                'duty_base_percent' => $payload['duty_base_percent'] ?? 0,
                'vat_rate_percent' => $payload['vat_rate_percent'] ?? 0,
                'sscl_rate_percent' => $payload['sscl_rate_percent'] ?? 0,
                'bank_interest_rate_pa' => $payload['bank_interest_rate_pa'] ?? null,
                'bank_interest_months' => $payload['bank_interest_months'] ?? null,
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
            'supplier',
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
        $dutyCostCalculation->load(['items', 'otherCosts', 'supplier']);

        return Inertia::render('Modules/Procurement/DutyCostCalculator/Pages/Edit', [
            'calculation' => $dutyCostCalculation,
            'statusOptions' => ['draft', 'finalized'],
            'suppliers' => $this->supplierOptions(),
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
                'supplier_id' => $payload['supplier_id'] ?? null,
                'supplier_name' => $payload['supplier_name'] ?? null,
                'purchasing_currency' => $payload['purchasing_currency'],
                'local_currency' => $payload['local_currency'],
                'shipment_currency_basis_notes' => $payload['shipment_currency_basis_notes'] ?? null,
                'exchange_rate' => $payload['exchange_rate'],
                'freight_currency' => $payload['freight_currency'] ?? null,
                'freight_exchange_rate' => $payload['freight_exchange_rate'] ?? null,
                'total_shipment_cbm' => $computed['summary']['total_cbm'] ?? 0,
                'freight_cost_total' => $payload['freight_cost_total'] ?? 0,
                'loading_unloading_cost_lkr' => $payload['loading_unloading_cost_lkr'] ?? 0,
                'transport_cost_lkr' => $payload['transport_cost_lkr'] ?? 0,
                'delivery_order_charges_lkr' => $payload['delivery_order_charges_lkr'] ?? 0,
                'clearing_charges_lkr' => $payload['clearing_charges_lkr'] ?? 0,
                'demurrage_cost_lkr' => $payload['demurrage_cost_lkr'] ?? 0,
                'additional_entry_cost_lkr' => $payload['additional_entry_cost_lkr'] ?? 0,
                'cid_rate_per_kg_lkr' => $payload['cid_rate_per_kg_lkr'] ?? 0,
                'cid_basis' => $payload['cid_basis'] ?? 'weight',
                'eid_rate_per_kg_lkr' => $payload['eid_rate_per_kg_lkr'] ?? 0,
                'eid_basis' => $payload['eid_basis'] ?? 'weight',
                'statistical_value_basis' => $payload['statistical_value_basis'] ?? 'weight',
                'duty_base_percent' => $payload['duty_base_percent'] ?? 0,
                'vat_rate_percent' => $payload['vat_rate_percent'] ?? 0,
                'sscl_rate_percent' => $payload['sscl_rate_percent'] ?? 0,
                'bank_interest_rate_pa' => $payload['bank_interest_rate_pa'] ?? null,
                'bank_interest_months' => $payload['bank_interest_months'] ?? null,
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

    /**
     * Interpret `date_from` / `date_to` as inclusive calendar days in the company time zone,
     * applied to `updated_at` so presets like “Today” match the list’s “Date Updated” column
     * (including rows created earlier but edited in the range).
     *
     * @param  Builder<DutyCostCalculation>  $query
     */
    private function scopeUpdatedAtToFilterDates(Builder $query, Request $request): void
    {
        $tz = (string) (app(CompanySettingsPresenter::class)->shared()['time_zone'] ?? config('app.timezone'));
        if (trim($tz) === '') {
            $tz = (string) config('app.timezone');
        }

        try {
            new \DateTimeZone($tz);
        } catch (\Throwable) {
            $tz = (string) config('app.timezone');
        }

        $isYmd = static fn (string $s): bool => (bool) preg_match('/^\d{4}-\d{2}-\d{2}$/', trim($s));

        if ($isYmd($request->string('date_from')->toString())) {
            $from = trim($request->string('date_from')->toString());
            $start = Carbon::parse($from, $tz)->startOfDay();
            $query->where('updated_at', '>=', $start);
        }

        if ($isYmd($request->string('date_to')->toString())) {
            $to = trim($request->string('date_to')->toString());
            $end = Carbon::parse($to, $tz)->endOfDay();
            $query->where('updated_at', '<=', $end);
        }
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
            'total_customs_base_lkr' => $summary['total_customs_base_lkr'] ?? 0,
            'total_cid_lkr' => $summary['total_cid_lkr'] ?? 0,
            'total_eid_lkr' => $summary['total_eid_lkr'] ?? 0,
            'total_vat_lkr' => $summary['total_vat_lkr'] ?? 0,
            'total_sscl_lkr' => $summary['total_sscl_lkr'] ?? 0,
            'total_duty_lkr' => $summary['total_duty_lkr'] ?? 0,
            'total_allocated_freight_lkr' => $summary['total_allocated_freight_lkr'] ?? 0,
            'total_allocated_other_costs_lkr' => $summary['total_allocated_other_costs_lkr'] ?? 0,
            'total_bank_charges_lkr' => $summary['total_bank_charges_lkr'] ?? 0,
            'grand_total_landed_cost_lkr' => $summary['grand_total_landed_cost_lkr'] ?? 0,
            'total_weight_kg' => $summary['total_weight_kg'] ?? 0,
            'total_cbm' => $summary['total_cbm'] ?? 0,
            'freight_cost_per_cbm_lkr' => $summary['freight_cost_per_cbm_lkr'] ?? 0,
        ];
    }

    private function supplierOptions(): array
    {
        return Supplier::query()
            ->where('is_active', true)
            ->orderBy('display_name')
            ->get(['id', 'display_name', 'company_name'])
            ->map(fn (Supplier $supplier) => [
                'id' => $supplier->id,
                'display_name' => $supplier->display_name,
                'company_name' => $supplier->company_name,
            ])
            ->all();
    }
}
