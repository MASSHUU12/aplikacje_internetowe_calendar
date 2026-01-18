import { instance } from './api';

export type EventDto = {
    id: number;
    calendar_id: number;
    title: string;
    description?: string | null;
    location?: string | null;
    starts_at: string; // ISO
    ends_at: string; // ISO
    all_day: boolean;
    timezone: string;
    recurrence_rule?: string | null;
    status?: 'confirmed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
};

export type EventCreate = {
    title: string;
    description?: string | null;
    location?: string | null;
    starts_at: string; // ISO
    ends_at: string; // ISO
    all_day?: boolean; // default false
    timezone?: string; // default Europe/Warsaw
    recurrence_rule?: string | null;
};

export type EventUpdate = Partial<{
    title: string;
    description: string | null;
    location: string | null;
    starts_at: string; // ISO
    ends_at: string; // ISO
    all_day: boolean;
    timezone: string;
    recurrence_rule: string | null;
    status: 'confirmed' | 'cancelled';
}>;

export async function createEvent(
    calendarId: number,
    payload: EventCreate,
): Promise<EventDto> {
    const res = await instance
        .post(`calendars/${calendarId}/events`, { json: payload })
        .json<{ event: EventDto }>();

    return res.event;
}

export async function updateEvent(
    eventId: number,
    payload: EventUpdate,
): Promise<EventDto> {
    const res = await instance
        .patch(`events/${eventId}`, { json: payload })
        .json<{ event: EventDto }>();

    return res.event;
}

export async function deleteEvent(eventId: number): Promise<void> {
    await instance.delete(`events/${eventId}`);
}

export async function listEvents(
    calendarId: number,
    options?: { from?: string; to?: string },
): Promise<EventDto[]> {
    const searchParams = new URLSearchParams();
    if (options?.from) {
        searchParams.set('from', options.from);
    }
    if (options?.to) {
        searchParams.set('to', options.to);
    }

    const res = await instance
        .get(`calendars/${calendarId}/events`, {
            searchParams,
        })
        .json<{ items: EventDto[] }>();

    return res.items;
}
