<?php

namespace App\Http\Controllers;

use App\Actions\Suppliers\CreateSupplierAction;
use App\Actions\Suppliers\UpdateSupplierAction;
use App\Http\Requests\SupplierStoreRequest;
use App\Http\Requests\SupplierUpdateRequest;
use App\Models\Supplier;
use App\Services\Suppliers\SupplierCodeGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Supplier::class, 'supplier');
    }

    public function index(Request $request): Response
    {
        $query = Supplier::query();

        if ($search = trim((string) $request->string('q'))) {
            $phoneSearch = preg_replace('/\D+/', '', $search) ?? '';
            $query->where(function ($q) use ($search, $phoneSearch) {
                $q->where('supplier_code', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('primary_phone_number', 'like', "%{$search}%");

                if ($phoneSearch !== '') {
                    $q->orWhere('primary_phone_number', 'like', "%{$phoneSearch}%");
                }
            });
        }

        if (($status = $request->string('status')->toString()) !== '') {
            if ($status === 'active') {
                $query->where('is_active', true);
            }
            if ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $suppliers = $query
            ->orderBy('display_name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Supplier $supplier) => [
                ...$supplier->toArray(),
                'can_view' => $request->user()?->can('view', $supplier) ?? false,
                'can_edit' => $request->user()?->can('update', $supplier) ?? false,
                'can_delete' => $request->user()?->can('delete', $supplier) ?? false,
            ]);

        return Inertia::render('Modules/Suppliers/Pages/Index', [
            'suppliers' => $suppliers,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => ['active', 'inactive'],
            'canCreate' => $request->user()?->can('create', Supplier::class) ?? false,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Suppliers/Pages/Create', [
            'nextSupplierCode' => app(SupplierCodeGeneratorService::class)->nextCode(),
        ]);
    }

    public function store(SupplierStoreRequest $request): RedirectResponse
    {
        $payload = $request->validated();
        $payload['created_by'] = $request->user()?->id;
        $payload['updated_by'] = $request->user()?->id;

        $supplier = app(CreateSupplierAction::class)->execute($payload);

        return redirect()->route('procurement.suppliers.show', $supplier)->with('success', 'Supplier created.');
    }

    public function show(Supplier $supplier): Response
    {
        $supplier->load(['creator:id,name', 'updater:id,name']);

        return Inertia::render('Modules/Suppliers/Pages/Show', [
            'supplier' => $supplier,
            'canEdit' => request()->user()?->can('update', $supplier) ?? false,
            'canDelete' => request()->user()?->can('delete', $supplier) ?? false,
        ]);
    }

    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('Modules/Suppliers/Pages/Edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(SupplierUpdateRequest $request, Supplier $supplier): RedirectResponse
    {
        $payload = $request->validated();
        $payload['updated_by'] = $request->user()?->id;

        app(UpdateSupplierAction::class)->execute($supplier, $payload);

        return redirect()->route('procurement.suppliers.show', $supplier)->with('success', 'Supplier updated.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        return redirect()->route('procurement.suppliers.index')->with('success', 'Supplier deleted.');
    }
}
