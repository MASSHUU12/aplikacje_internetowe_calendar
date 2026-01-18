import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    Calendar,
    dateFnsLocalizer,
    type Event as RBCEvent,
    Views,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { getToken } from '@/api/api';
import { createEvent as apiCreateEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent, listEvents } from '@/api/events';
import { listCalendars } from '@/api/calendars';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';

import '../../css/calendar-overrides.css';

type CalendarEvent = RBCEvent & {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
};

const locales = { pl };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

export default function Dashboard() {
    const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(
        Views.MONTH,
    );
    const [date, setDate] = useState<Date>(new Date());

    const [events, setEvents] = useState<CalendarEvent[]>(() => []);
    const [selectedCalendarId, setSelectedCalendarId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useEffect(() => {
        if (!getToken()) {
            router.visit('/login', { replace: true });
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const items = await listCalendars();
                if (!cancelled) {
                    if (items.length > 0) {
                        setSelectedCalendarId((prev) => prev ?? items[0].id);
                    }
                }
            } catch (e) {
                console.error('Failed to load calendars', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (selectedCalendarId == null) {
                setEvents([]);
                return;
            }
            try {
                const items = await listEvents(selectedCalendarId);
                if (!cancelled) {
                    const mapped: CalendarEvent[] = items.map((it) => ({
                        id: it.id,
                        title: it.title,
                        start: new Date(it.starts_at),
                        end: new Date(it.ends_at),
                        allDay: it.all_day,
                    }));
                    setEvents(mapped);
                }
            } catch (e) {
                console.error('Failed to load events', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [selectedCalendarId]);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const titleRef = useRef<HTMLInputElement | null>(null);

    type Draft = {
        title: string;
        start: string;
        end: string;
        allDay: boolean;
    };

    const [draft, setDraft] = useState<Draft>({
        title: '',
        start: '',
        end: '',
        allDay: false,
    });

    const dateToLocalInput = (d: Date): string => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const localInputToDate = (v: string): Date => {
        return new Date(v);
    };

    const openCreateModal = ({ start, end }: { start: Date; end: Date }) => {
        setMode('create');
        setEditingId(null);
        setDraft({
            title: '',
            start: dateToLocalInput(start),
            end: dateToLocalInput(end),
            allDay: false,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (ev: CalendarEvent) => {
        setMode('edit');
        setEditingId(ev.id);
        setDraft({
            title: ev.title,
            start: dateToLocalInput(ev.start),
            end: dateToLocalInput(ev.end),
            allDay: Boolean(ev.allDay),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => titleRef.current?.focus(), 0);
        }
    }, [isModalOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
            }
        };
        if (isModalOpen) {
            window.addEventListener('keydown', onKey);
        }
        return () => window.removeEventListener('keydown', onKey);
    }, [isModalOpen]);

    const onSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        openCreateModal({ start, end });
    };

    const onSelectEvent = (event: CalendarEvent) => {
        openEditModal(event);
    };

    const saveDraft = async () => {
        const start = localInputToDate(draft.start);
        const end = localInputToDate(draft.end);

        if (!draft.title.trim()) {
            alert('Podaj nazwę wydarzenia.');
            return;
        }
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert('Nieprawidłowa data.');
            return;
        }
        if (end < start) {
            alert(
                'Data zakończenia nie może być wcześniejsza niż rozpoczęcia.',
            );
            return;
        }
        try {
            setIsSaving(true);
            if (mode === 'create') {
                if (selectedCalendarId == null) {
                    alert('Brak wybranego kalendarza. Nie można zapisać wydarzenia.');
                    return;
                }

                const created = await apiCreateEvent(selectedCalendarId, {
                    title: draft.title.trim(),
                    starts_at: start.toISOString(),
                    ends_at: end.toISOString(),
                    all_day: draft.allDay,
                    timezone: 'Europe/Warsaw',
                });

                const mapped: CalendarEvent = {
                    id: created.id,
                    title: created.title,
                    start: new Date(created.starts_at),
                    end: new Date(created.ends_at),
                    allDay: created.all_day,
                };
                setEvents((prev) => [...prev, mapped]);
            } else if (mode === 'edit' && editingId != null) {
                const updated = await apiUpdateEvent(editingId, {
                    title: draft.title.trim(),
                    starts_at: start.toISOString(),
                    ends_at: end.toISOString(),
                    all_day: draft.allDay,
                });

                setEvents((prev) =>
                    prev.map((ev) =>
                        ev.id === updated.id
                            ? {
                                id: updated.id,
                                title: updated.title,
                                start: new Date(updated.starts_at),
                                end: new Date(updated.ends_at),
                                allDay: updated.all_day,
                            }
                            : ev,
                    ),
                );
            }

            setIsModalOpen(false);
        } catch (e: unknown) {

            console.error(e);
            alert('Nie udało się zapisać wydarzenia. Spróbuj ponownie.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteEvent = async () => {
        if (mode === 'edit' && editingId != null) {
            const sure = confirm('Czy na pewno usunąć to wydarzenie?');
            if (!sure) return;
            try {
                setIsDeleting(true);
                await apiDeleteEvent(editingId);
                setEvents((prev) => prev.filter((ev) => ev.id !== editingId));
                setIsModalOpen(false);
            } catch (e) {

                console.error(e);
                alert('Nie udało się usunąć wydarzenia. Spróbuj ponownie.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.topbar}>
                <div>
                    <h1 style={styles.title}>Dashboard</h1>
                </div>

                <div style={styles.actions}>
                    <button
                        style={styles.btn}
                        onClick={() => router.visit('/logout')}
                    >
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
            {isModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="event-modal-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                    style={styles.modalOverlay}
                >
                    <div
                        style={styles.modalCard}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={styles.modalHeader}>
                            <h2
                                id="event-modal-title"
                                style={{
                                    margin: 0,
                                    fontSize: 18,
                                    fontWeight: 800,
                                }}
                            >
                                {mode === 'create'
                                    ? 'Dodaj wydarzenie'
                                    : 'Edytuj wydarzenie'}
                            </h2>
                            <button
                                style={styles.iconBtn}
                                onClick={closeModal}
                                aria-label="Zamknij"
                            >
                                ×
                            </button>
                        </div>

                        <div style={styles.formGrid}>
                            <label style={styles.label}>
                                Tytuł
                                <input
                                    ref={titleRef}
                                    type="text"
                                    value={draft.title}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            title: e.target.value,
                                        }))
                                    }
                                    style={styles.input}
                                />
                            </label>

                            <label style={styles.label}>
                                Od
                                <input
                                    type="datetime-local"
                                    value={draft.start}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            start: e.target.value,
                                        }))
                                    }
                                    style={styles.input}
                                />
                            </label>

                            <label style={styles.label}>
                                Do
                                <input
                                    type="datetime-local"
                                    value={draft.end}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            end: e.target.value,
                                        }))
                                    }
                                    style={styles.input}
                                />
                            </label>

                            <label
                                style={{
                                    ...styles.label,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={draft.allDay}
                                    onChange={(e) =>
                                        setDraft((d) => ({
                                            ...d,
                                            allDay: e.target.checked,
                                        }))
                                    }
                                />
                                Wydarzenie całodniowe
                            </label>
                        </div>

                        <div style={styles.modalFooter}>
                            {mode === 'edit' && (
                                <button
                                    onClick={deleteEvent}
                                    style={{
                                        ...styles.btn,
                                        background: 'rgba(239,68,68,.12)',
                                        borderColor: 'rgba(239,68,68,.35)',
                                    }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Usuwanie...' : 'Usuń'}
                                </button>
                            )}
                            <div style={{ flex: 1 }} />
                            <button
                                onClick={closeModal}
                                style={{
                                    ...styles.btn,
                                    background: 'rgba(255,255,255,.04)',
                                }}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={saveDraft}
                                style={{
                                    ...styles.btn,
                                    background: 'rgba(16,185,129,.18)',
                                    borderColor: 'rgba(16,185,129,.45)',
                                }}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
    subtitle: {
        margin: '6px 0 0',
        fontSize: 13,
        color: 'rgba(234,240,255,.75)',
    },
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
        height: '78vh',
        minHeight: 520,
    },
    modalOverlay: {
        position: 'fixed' as const,
        inset: 0,
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 50,
    },
    modalCard: {
        width: '100%',
        maxWidth: 520,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,.15)',
        background: '#1a202c',
        backgroundImage: 'linear-gradient(180deg, #1f2937, #111827)',
        color: '#eaf0ff',
        boxShadow: '0 25px 70px rgba(0,0,0,.85)',
        padding: 24,
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: 12,
    },
    iconBtn: {
        borderRadius: 10,
        padding: '6px 10px',
        border: '1px solid rgba(255,255,255,.14)',
        background: 'rgba(255,255,255,.06)',
        color: '#eaf0ff',
        fontWeight: 800,
        cursor: 'pointer',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: 'rgba(234,240,255,.9)',
        display: 'grid',
        gap: 8,
    },
    input: {
        borderRadius: 10,
        padding: '12px 14px',
        border: '1px solid rgba(255,255,255,.14)',
        background: 'rgba(0,0,0,.4)',
        color: '#fff',
        outline: 'none',
        fontSize: 14,
    },
    modalFooter: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },

};

