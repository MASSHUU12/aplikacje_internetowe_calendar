import { instance } from './api';

export type CalendarDto = {
    id: number;
    name: string;
    color?: string | null;
    role?: 'owner' | 'editor' | 'viewer';
    created_at?: string;
    updated_at?: string;
};

export async function listCalendars(): Promise<CalendarDto[]> {
    const res = await instance
        .get('calendars')
        .json<{ items: CalendarDto[] }>();

    return res.items;
}
