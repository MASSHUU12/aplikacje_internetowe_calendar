import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import { getToken } from '@/api/api';

export default function Home() {
    const isLoggedIn = useMemo(() => Boolean(getToken()), []);

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Home</h1>

                {!isLoggedIn ? (
                    <>
                        <p style={styles.subtitle}>
                            Zaloguj się lub zarejestruj, jeżeli nie masz jeszcze konta.
                        </p>

                        <div style={styles.row}>
                            <button
                                style={styles.button}
                                onClick={() => router.visit('/login')}
                            >
                                Zaloguj
                            </button>
                            <button
                                style={styles.button}
                                onClick={() => router.visit('/register')}
                            >
                                Zarejestruj
                            </button>
                        </div>

                        {isLoggedIn && (
                            <button
                                style={{ ...styles.button, width: '100%', marginTop: 10 }}
                                onClick={() => router.visit('/dashboard')}
                            >
                                Przejdź do Dashboard
                            </button>
                        )}

                    </>
                ) : (
                    <>
                        <p style={styles.subtitle}>
                            ✅ Jesteś już zalogowany.
                        </p>

                        <div style={styles.row}>
                            <button
                                style={styles.button}
                                onClick={() => router.visit('/dashboard')}
                            >
                                Przejdź do Dashboard
                            </button>
                            <button
                                style={styles.button}
                                onClick={() => router.visit('/logout')}
                            >
                                Wyloguj
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '28px 16px',
        background:
            'radial-gradient(1200px 700px at 15% 10%, rgba(99,102,241,.28), transparent 60%), radial-gradient(1000px 700px at 85% 30%, rgba(16,185,129,.18), transparent 55%), #0b1020',
        color: '#eaf0ff',
        fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    card: {
        width: 'min(520px, 100%)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,.12)',
        background:
            'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))',
        boxShadow: '0 25px 70px rgba(0,0,0,.55)',
        padding: 18,
        backdropFilter: 'blur(10px)',
        textAlign: 'center' as const,
    },
    title: { margin: 0, fontSize: 26, fontWeight: 850},
    subtitle: {
        margin: '8px 0 14px',
        fontSize: 14,
        color: 'rgba(234,240,255,.75)',
    },
    row: {
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        borderRadius: 14,
        padding: '12px 14px',
        border: '1px solid rgba(255,255,255,.14)',
        background: 'rgba(255,255,255,.06)',
        color: '#eaf0ff',
        fontWeight: 800,
        cursor: 'pointer',
    },
};
