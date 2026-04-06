<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Modules/Settings/System/Pages/Edit', [
            'themeMode' => $request->user()?->theme_preference ?? 'system',
        ]);
    }

    public function updateTheme(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme_mode' => ['required', 'in:light,dark,system'],
        ]);

        $request->user()?->update([
            'theme_preference' => $validated['theme_mode'],
        ]);

        return back()->with('success', 'Appearance preference updated.');
    }
}
