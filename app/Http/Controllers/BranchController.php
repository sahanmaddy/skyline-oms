<?php

namespace App\Http\Controllers;

use App\Actions\Branches\DeleteBranchAction;
use App\Actions\Branches\SyncBranchPhoneNumbersAction;
use App\Http\Requests\BranchStoreRequest;
use App\Http\Requests\BranchUpdateRequest;
use App\Models\Branch;
use App\Models\User;
use App\Services\Branches\BranchCodeGeneratorService;
use App\Services\Branches\BranchScopeService;
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
            ->with(['phoneNumbers'])
            ->withCount([
                'employees',
                'usersWithAccess as users_count',
                'users as default_branch_users_count',
            ]);

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('state_province', 'like', "%{$search}%")
                    ->orWhere('postal_code', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhereHas(
                        'phoneNumbers',
                        fn ($p) => $p->where('phone_number', 'like', "%{$search}%"),
                    );
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
                $inUse = ($branch->users_count > 0)
                    || ($branch->default_branch_users_count > 0)
                    || ($branch->employees_count > 0);

                return array_merge($branch->toArray(), [
                    'can_view' => $request->user()?->can('view', $branch) ?? false,
                    'can_edit' => $request->user()?->can('update', $branch) ?? false,
                    'can_delete' => ($request->user()?->can('delete', $branch) ?? false) && ! $inUse,
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
        $phoneNumbers = $data['phone_numbers'] ?? [];
        unset($data['phone_numbers']);

        $branch = DB::transaction(function () use ($data, $phoneNumbers) {
            $data['code'] = app(BranchCodeGeneratorService::class)->nextCode();
            $branch = Branch::create($data);
            app(SyncBranchPhoneNumbersAction::class)->execute($branch, $phoneNumbers);

            return $branch;
        });

        return redirect()->route('settings.branches.show', $branch)->with('success', 'Branch created.');
    }

    public function show(Branch $branch): Response
    {
        $branch->load(['phoneNumbers']);
        $branch->loadCount([
            'employees',
            'usersWithAccess as users_count',
            'users as default_branch_users_count',
        ]);

        $users = User::query()
            ->where(function ($q) use ($branch) {
                $q->where('branch_id', $branch->id)
                    ->orWhereHas('assignedBranches', fn ($b) => $b->where('branches.id', $branch->id));
            })
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'email', 'status']);

        $employees = $branch->employees()
            ->orderBy('display_name')
            ->limit(20)
            ->get(['id', 'employee_code', 'display_name', 'status']);

        $inUse = $branch->users_count > 0
            || $branch->default_branch_users_count > 0
            || $branch->employees_count > 0;

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
            'branch' => $branch->load('phoneNumbers'),
        ]);
    }

    public function update(BranchUpdateRequest $request, Branch $branch): RedirectResponse
    {
        $data = $request->validated();
        $phoneNumbers = $data['phone_numbers'] ?? [];
        unset($data['phone_numbers']);

        DB::transaction(function () use ($branch, $data, $phoneNumbers) {
            $branch->update($data);
            app(SyncBranchPhoneNumbersAction::class)->execute($branch, $phoneNumbers);
        });

        return redirect()->route('settings.branches.show', $branch)->with('success', 'Branch updated.');
    }

    public function destroy(Request $request, Branch $branch, DeleteBranchAction $deleteBranch): RedirectResponse
    {
        $this->authorize('delete', $branch);

        $deletedId = (int) $branch->id;

        try {
            $deleteBranch->execute($branch);
        } catch (DomainException $e) {
            return redirect()->route('settings.branches.show', $branch)->with('error', $e->getMessage());
        }

        $user = $request->user();
        if ($user instanceof User) {
            $user->refresh();
            app(BranchScopeService::class)->clearSessionIfPointingAtRemovedBranch($request, $user, $deletedId);
        }

        return redirect()->route('settings.branches.index')->with('success', 'Branch deleted.');
    }
}
