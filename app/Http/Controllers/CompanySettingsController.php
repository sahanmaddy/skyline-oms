<?php

namespace App\Http\Controllers;

use App\Actions\Organization\UpdateCompanySettingsAction;
use App\Http\Requests\CompanySettingsUpdateRequest;
use App\Models\CompanySetting;
use App\Services\Organization\CompanySettingsPresenter;
use DateTimeZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanySettingsController extends Controller
{
    public function __construct(
        private readonly CompanySettingsPresenter $presenter,
    ) {}

    public function edit(Request $request): Response
    {
        $setting = CompanySetting::current()->load([
            'phoneNumbers' => fn ($q) => $q->orderBy('display_order')->orderBy('id'),
            'bankAccounts' => fn ($q) => $q->orderBy('display_order')->orderBy('id'),
        ]);

        $this->authorize('view', $setting);

        $timeZones = collect(DateTimeZone::listIdentifiers())
            ->filter(fn (string $id) => ! str_contains($id, '/Etc/'))
            ->values()
            ->all();

        return Inertia::render('Modules/Settings/Company/Pages/Edit', [
            'companySetting' => $this->presenter->forEditPage($setting),
            'canEdit' => $request->user()?->can('update', $setting) ?? false,
            'timeZoneOptions' => $timeZones,
            'phoneTypeOptions' => ['Office', 'Mobile', 'Hotline', 'WhatsApp', 'Other'],
            'currencyFormatExamples' => [
                '{symbol} {amount}',
                '{code} {amount}',
                '{amount} {code}',
            ],
        ]);
    }

    public function siteIcon()
    {
        $setting = CompanySetting::query()
            ->select(['site_icon_path'])
            ->orderBy('id')
            ->first();

        if (! $setting?->site_icon_path || ! Storage::disk('public')->exists($setting->site_icon_path)) {
            abort(404);
        }

        return Storage::disk('public')->response(
            $setting->site_icon_path,
            null,
            ['Cache-Control' => 'public, max-age=3600, stale-while-revalidate=86400'],
        );
    }

    public function update(
        CompanySettingsUpdateRequest $request,
        UpdateCompanySettingsAction $action,
    ): RedirectResponse {
        $setting = CompanySetting::current();
        $this->authorize('update', $setting);

        $validated = $request->validated();
        $remove = (bool) $request->boolean('remove_site_icon');
        $icon = $request->file('site_icon');

        $action->execute(
            $setting,
            $validated,
            $icon,
            $remove,
            $request->user(),
        );

        return redirect()->route('settings.company')->with('success', 'Company settings saved.');
    }
}
