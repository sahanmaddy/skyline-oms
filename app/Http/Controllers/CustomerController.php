<?php

namespace App\Http\Controllers;

use App\Actions\Customers\CreateCustomerAction;
use App\Actions\Customers\UpdateCustomerAction;
use App\Enums\CustomerDocumentType;
use App\Enums\CustomerStatus;
use App\Http\Requests\CustomerStoreRequest;
use App\Http\Requests\CustomerUpdateRequest;
use App\Models\Customer;
use App\Services\Customers\CustomerCodeGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Customer::class, 'customer');
    }

    public function index(Request $request): Response
    {
        $query = Customer::query()->with('phoneNumbers');

        if ($search = trim((string) $request->string('q'))) {
            $phoneSearch = preg_replace('/\D+/', '', $search) ?? '';
            $phoneSearch = ltrim($phoneSearch, '0');
            $phoneTerm = $phoneSearch !== '' ? $phoneSearch : $search;
            $searchFold = preg_replace('/[\s\-]+/u', '', mb_strtolower($search));

            $query->where(function ($q) use ($search, $phoneTerm, $searchFold) {
                $q->where('customer_code', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('nic', 'like', "%{$search}%")
                    ->orWhere('vat_tax_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('phoneNumbers', function ($p) use ($phoneTerm) {
                        $p->where('phone_number', 'like', "%{$phoneTerm}%");
                    });

                if ($searchFold !== '') {
                    $q->orWhereRaw(
                        "REPLACE(REPLACE(LOWER(CONCAT(COALESCE(display_name,''), COALESCE(customer_name,''), COALESCE(notes,''))), ' ', ''), '-', '') LIKE ?",
                        ['%'.$searchFold.'%']
                    );
                }
            });
        }

        if ($status = $request->string('status')->toString()) {
            if (in_array($status, CustomerStatus::values(), true)) {
                $query->where('status', $status);
            }
        }

        return Inertia::render('Modules/Customers/Pages/Index', [
            'customers' => $query->orderBy('display_name')->paginate(15)->withQueryString(),
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => CustomerStatus::values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Customers/Pages/Create', [
            'statusOptions' => CustomerStatus::values(),
            'nextCustomerCode' => app(CustomerCodeGeneratorService::class)->nextCode(),
        ]);
    }

    public function store(CustomerStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $phoneNumbers = $validated['phone_numbers'] ?? [];
        unset($validated['phone_numbers']);

        $customer = app(CreateCustomerAction::class)->execute($validated, $phoneNumbers);

        return redirect()->route('sales.customers.show', $customer)->with('success', 'Customer created.');
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'phoneNumbers',
            'documents' => fn ($q) => $q->with('uploader:id,name')->latest(),
        ]);

        return Inertia::render('Modules/Customers/Pages/Show', [
            'customer' => $customer,
            'documentTypeOptions' => CustomerDocumentType::values(),
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Modules/Customers/Pages/Edit', [
            'customer' => $customer->load('phoneNumbers'),
            'statusOptions' => CustomerStatus::values(),
        ]);
    }

    public function update(CustomerUpdateRequest $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validated();
        $phoneNumbers = $validated['phone_numbers'] ?? [];
        unset($validated['phone_numbers']);

        app(UpdateCustomerAction::class)->execute($customer, $validated, $phoneNumbers);

        return redirect()->route('sales.customers.show', $customer)->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('sales.customers.index')->with('success', 'Customer deleted.');
    }
}
