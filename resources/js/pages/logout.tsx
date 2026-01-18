import { logout } from '@/api/logout';
import { clearToken } from '@/api/api';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

export default function Logout() {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const doLogout = async () => {
            try {
                await logout();
            } catch (err) {
                console.error(err);
                setError('Nie udało się poprawnie wylogować z serwera.');
            } finally {
                clearToken();
                router.visit('/', { replace: true });
            }
        };

        doLogout();
    }, []);

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.spinner} />
                <h1 style={styles.title}>Wylogowywanie…</h1>
                <p style={styles.subtitle}>
                    {error ?? 'Za chwilę nastąpi przekierowanie'}
                </p>
            </div>
        </div>
    );
}

type LogoutStyles = {
    page: CSSProperties;
    card: CSSProperties;
    title: CSSProperties;
    subtitle: CSSProperties;
    spinner: CSSProperties;
};

const styles: LogoutStyles = {
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
        width: 360,
        padding: '32px 24px',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,.12)',
        background:
            'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))',
        boxShadow: '0 25px 70px rgba(0,0,0,.55)',
        display: 'grid',
        gap: 14,
        justifyItems: 'center',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
    },

    title: {
        margin: 0,
        fontSize: 20,
        fontWeight: 800,
        letterSpacing: '-0.01em',
    },

    subtitle: {
        margin: 0,
        fontSize: 13,
        color: 'rgba(234,240,255,.70)',
    },

    spinner: {
        width: 42,
        height: 42,
        borderRadius: '50%',
        border: '3px solid rgba(255,255,255,.25)',
        borderTopColor: '#fff',
        animation: 'spin 0.8s linear infinite',
    },
};

const styleElId = '__logout_spinner__';
if (typeof document !== 'undefined' && !document.getElementById(styleElId)) {
    const style = document.createElement('style');
    style.id = styleElId;
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
}
