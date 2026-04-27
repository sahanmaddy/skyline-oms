<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductCategoryStoreRequest;
use App\Http\Requests\ProductCategoryUpdateRequest;
use App\Models\ProductCategory;
use App\Services\Inventory\InventoryCodeGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ProductCategory::class, 'product_category');
    }

    public function index(Request $request): Response
    {
        $query = ProductCategory::query()->ordered();

        if ($search = trim((string) $request->string('q'))) {
            $query->search($search);
        }

        if (($status = $request->string('status')->toString()) !== '') {
            if (in_array($status, ['active', 'inactive'], true)) {
                $query->where('status', $status);
            }
        }

        $categories = $query
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ProductCategory $c) => [
                ...$c->toArray(),
                'can_view' => $request->user()?->can('view', $c) ?? false,
                'can_edit' => $request->user()?->can('update', $c) ?? false,
                'can_delete' => ($request->user()?->can('delete', $c) ?? false) && ! $c->isReferencedByProducts(),
            ]);

        return Inertia::render('Modules/Inventory/Pages/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => ['active', 'inactive'],
            'canCreate' => $request->user()?->can('create', ProductCategory::class) ?? false,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Inventory/Pages/Categories/Create');
    }

    public function store(ProductCategoryStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $category = DB::transaction(function () use ($data) {
            $code = app(InventoryCodeGeneratorService::class)->nextSequentialCode(
                'product_categories',
                'category_code',
                'CAT-',
            );

            return ProductCategory::query()->create([
                ...$data,
                'category_code' => $code,
            ]);
        });

        return redirect()
            ->route('inventory.categories.show', $category)
            ->with('success', 'Category created.');
    }

    public function show(ProductCategory $productCategory): Response
    {
        return Inertia::render('Modules/Inventory/Pages/Categories/Show', [
            'category' => $productCategory,
            'canEdit' => request()->user()?->can('update', $productCategory) ?? false,
            'canDelete' => (request()->user()?->can('delete', $productCategory) ?? false)
                && ! $productCategory->isReferencedByProducts(),
        ]);
    }

    public function edit(ProductCategory $productCategory): Response
    {
        return Inertia::render('Modules/Inventory/Pages/Categories/Edit', [
            'category' => $productCategory,
        ]);
    }

    public function update(ProductCategoryUpdateRequest $request, ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->update($request->validated());

        return redirect()
            ->route('inventory.categories.show', $productCategory)
            ->with('success', 'Category updated.');
    }

    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        if ($productCategory->isReferencedByProducts()) {
            return redirect()
                ->route('inventory.categories.index')
                ->with('error', 'This category is linked to products and cannot be deleted.');
        }

        $productCategory->delete();

        return redirect()
            ->route('inventory.categories.index')
            ->with('success', 'Category deleted.');
    }
}
