<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Calendar;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (Calendar::where('owner_user_id', $user->id)->doesntExist()) {
            Calendar::create([
                'owner_user_id' => $user->id,
                'name' => 'Mój kalendarz',
                'color' => '#3b82f6',
            ]);
        }

        $items = Calendar::query()
            ->where('owner_user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($c, $key) {
                $c->role = 'owner';
                $c->is_default = ($key === 0);
                return $c;
            });

        return response()->json([
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $calendar = Calendar::create([
            'owner_user_id' => $request->user()->id,
            'name' => $data['name'],
            'color' => $data['color'] ?? null,
        ]);

        $calendar->role = 'owner';
        $calendar->is_default = false;

        return response()->json([
            'calendar' => $calendar,
        ], 201);
    }

    public function show(Request $request, Calendar $calendar)
    {
        if ($calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        $calendar->role = 'owner';

        return response()->json([
            'calendar' => $calendar,
        ]);
    }

    public function update(Request $request, Calendar $calendar)
    {
        if ($calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $calendar->update($data);
        $calendar->role = 'owner';

        return response()->json([
            'calendar' => $calendar,
        ]);
    }

    public function destroy(Request $request, Calendar $calendar)
    {
        if ($calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        $calendar->delete();

        return response()->noContent();
    }
}
