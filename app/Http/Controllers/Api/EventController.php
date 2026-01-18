<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Calendar;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request, Calendar $calendar)
    {
        if ($calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        $query = Event::query()
            ->where('calendar_id', $calendar->id);

        if ($request->has(['from', 'to'])) {
            $data = $request->validate([
                'from' => ['date'],
                'to' => ['date', 'after:from'],
            ]);

            $query->where('starts_at', '<', $data['to'])
                  ->where('ends_at', '>', $data['from']);
        }

        $items = $query->orderBy('starts_at')->get();

        return response()->json([
            'items' => $items,
        ]);
    }

    public function store(Request $request, Calendar $calendar)
    {
        if ($calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'all_day' => ['boolean'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'recurrence_rule' => ['nullable', 'string'],
        ]);

        $event = Event::create([
            'calendar_id' => $calendar->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'location' => $data['location'] ?? null,
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
            'all_day' => $data['all_day'] ?? false,
            'timezone' => $data['timezone'] ?? 'Europe/Warsaw',
            'recurrence_rule' => $data['recurrence_rule'] ?? null,
            'status' => 'confirmed',
        ]);

        return response()->json([
            'event' => $event,
        ], 201);
    }

    public function show(Request $request, Event $event)
    {
        if ($event->calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json([
            'event' => $event,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        if ($event->calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'all_day' => ['boolean'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'recurrence_rule' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:confirmed,cancelled'],
        ]);

        $event->update($data);

        return response()->json([
            'event' => $event,
        ]);
    }

    public function destroy(Request $request, Event $event)
    {
        if ($event->calendar->owner_user_id !== $request->user()->id) {
            abort(403);
        }

        $event->delete();

        return response()->noContent();
    }
}
