<?php

namespace App\Http\Controllers;

use App\Actions\Branches\DeleteBranchAction;
use App\Http\Requests\BranchStoreRequest;
use App\Http\Requests\BranchUpdateRequest;
use App\Models\Branch;
use App\Models\User;
use App\Services\Branches\BranchCodeGeneratorService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Branch::class, 'branch');
    }

    public function index(Request $request): Response
    {
        $query = Branch::query()
            ->withCount(['users', 'employees']);

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->string('status')->toString();
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $branches = $query->orderBy('code')->paginate(15)->withQueryString()->through(
            function (Branch $branch) use ($request) {
                return array_merge($branch->toArray(), [
                    'can_view' => $request->user()?->can('view', $branch) ?? false,
                    'can_edit' => $request->user()?->can('update', $branch) ?? false,
                    'can_delete' => $request->user()?->can('delete', $branch) ?? false,
                ]);
            }
        );

        return Inertia::render('Modules/Branches/Pages/Index', [
            'branches' => $branches,
            'canCreate' => $request->user()?->can('create', Branch::class) ?? false,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusOptions' => [
                ['value' => '', 'label' => 'All'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Modules/Branches/Pages/Create', [
            'nextCode' => app(BranchCodeGeneratorService::class)->nextCode(),
        ]);
    }

    public function store(BranchStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $branch = DB::transaction(function () use ($data) {
            $data['code'] = app(BranchCodeGeneratorService::class)->nextCode();

            return Branch::create($data);
        });

        return redirect()->route('settings.branches.show', $branch)->with('success', 'Branch created.');
    }

    public function show(Branch $branch): Response
    {
        $branch->loadCount(['users', 'employees']);

        $users = User::query()
            ->where('branch_id', $branch->id)
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'email', 'status']);

        $employees = $branch->employees()
            ->orderBy('display_name')
            ->limit(20)
            ->get(['id', 'employee_code', 'display_name', 'status']);

        $inUse = $branch->users_count > 0 || $branch->employees_count > 0;

        return Inertia::render('Modules/Branches/Pages/Show', [
            'branch' => $branch,
            'recentUsers' => $users,
            'recentEmployees' => $employees,
            'canEdit' => request()->user()?->can('update', $branch) ?? false,
            'canDelete' => (request()->user()?->can('delete', $branch) ?? false) && ! $inUse,
        ]);
    }

    public function edit(Branch $branch): Response
    {
        return Inertia::render('Modules/Branches/Pages/Edit', [
            'branch' => $branch,
        ]);
    }

    public function update(BranchUpdateRequest $request, Branch $branch): RedirectResponse
    {
        $branch->update($request->validated());

        return redirect()->route('settings.branches.show', $branch)->with('success', 'Branch updated.');
    }

    public function destroy(Branch $branch, DeleteBranchAction $deleteBranch): RedirectResponse
    {
        $this->authorize('delete', $branch);

        try {
            $deleteBranch->execute($branch);
        } catch (DomainException $e) {
            return redirect()->route('settings.branches.show', $branch)->with('error', $e->getMessage());
        }

        return redirect()->route('settings.branches.index')->with('success', 'Branch deleted.');
    }
}
