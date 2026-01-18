import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, type Event as RBCEvent, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';

type CalendarEvent = RBCEvent & {
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
};

const locales = { pl };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // poniedziałek
    getDay,
    locales,
});

export default function Dashboard() {
    // kontrolowanie view/date pomaga uniknąć problemów z nawigacją w niektórych setupach :contentReference[oaicite:4]{index=4}
    const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(Views.MONTH);
    const [date, setDate] = useState<Date>(new Date());

    const events = useMemo<CalendarEvent[]>(
        () => [
            {
                title: 'Przykładowe wydarzenie',
                start: new Date(),
                end: new Date(Date.now() + 60 * 60 * 1000),
            },
            {
                title: 'Cały dzień',
                start: new Date(),
                end: new Date(),
                allDay: true,
            },
        ],
        [],
    );

    const onSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        const title = window.prompt('Nazwa wydarzenia:');
        if (!title) return;

        // prosta wersja: w realnym projekcie wrzucimy to do useState i zapis do backendu
        alert(`Dodaję: "${title}" od ${start.toLocaleString()} do ${end.toLocaleString()}`);
    };

    const onSelectEvent = (event: CalendarEvent) => {
        alert(`Wybrano: ${event.title}`);
    };

    return (
        <div style={styles.page}>
            <div style={styles.topbar}>
                <div>
                    <h1 style={styles.title}>Dashboard</h1>
                    <p style={styles.subtitle}>Kalendarz (react-big-calendar)</p>
                </div>

                <div style={styles.actions}>
                    <button style={styles.btn} onClick={() => router.visit('/logout')}>
                        Wyloguj
                    </button>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.calendarWrap}>
                    <Calendar
                        localizer={localizer}
                        culture="pl"
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        selectable
                        onSelectSlot={onSelectSlot}
                        onSelectEvent={onSelectEvent}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        messages={{
                            today: 'Dziś',
                            previous: 'Wstecz',
                            next: 'Dalej',
                            month: 'Miesiąc',
                            week: 'Tydzień',
                            day: 'Dzień',
                            agenda: 'Agenda',
                            date: 'Data',
                            time: 'Godzina',
                            event: 'Wydarzenie',
                            noEventsInRange: 'Brak wydarzeń w tym zakresie.',
                            showMore: (total) => `+${total} więcej`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        padding: '18px 16px 26px',
        background:
            'radial-gradient(1200px 700px at 15% 10%, rgba(99,102,241,.18), transparent 60%), radial-gradient(1000px 700px at 85% 30%, rgba(16,185,129,.12), transparent 55%), #0b1020',
        color: '#eaf0ff',
        fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    topbar: {
        maxWidth: 1100,
        margin: '0 auto 14px',
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap' as const,
    },
    title: { margin: 0, fontSize: 26, fontWeight: 850 },
    subtitle: { margin: '6px 0 0', fontSize: 13, color: 'rgba(234,240,255,.75)' },
    actions: { display: 'flex', gap: 10, alignItems: 'center' },
    btn: {
        borderRadius: 14,
        padding: '12px 14px',
        border: '1px solid rgba(255,255,255,.14)',
        background: 'rgba(255,255,255,.06)',
        color: '#eaf0ff',
        fontWeight: 800,
        cursor: 'pointer',
    },
    card: {
        maxWidth: 1100,
        margin: '0 auto',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,.12)',
        background:
            'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))',
        boxShadow: '0 25px 70px rgba(0,0,0,.55)',
        padding: 14,
        backdropFilter: 'blur(10px)',
    },
    calendarWrap: {
        height: '78vh', // ważne dla poprawnego renderu :contentReference[oaicite:5]{index=5}
        minHeight: 520,
    },
};
