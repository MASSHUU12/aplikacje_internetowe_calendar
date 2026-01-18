import { setToken } from '@/api/api';
import { login } from '@/api/login';
import { router } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const canSubmit = useMemo(() => {
        return !isLoading && email.trim().length > 0 && password.length > 0;
    }, [email, password, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError(null);
        setIsLoading(true);

        try {
            const response = await login({ email: email.trim(), password });
            setToken(response.token);
            router.visit('/dashboard', { replace: true });
        } catch (err) {
            console.error(err);
            setError('Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.bgGlow} aria-hidden="true" />

            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.brandDot} />
                    <div>
                        <h1 style={styles.title}>Zaloguj się</h1>
                        <p style={styles.subtitle}>Wpisz email i hasło, aby przejść dalej.</p>
                    </div>
                </div>

                {error && (
                    <div style={styles.alert} role="alert">
                        <span style={styles.alertIcon}>!</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label htmlFor="email" style={styles.label}>
                            Email
                        </label>
                        <div style={styles.inputWrap}>
                            <span style={styles.inputIcon} aria-hidden="true">
                                @
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="np. jan@firma.pl"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label htmlFor="password" style={styles.label}>
                            Hasło
                        </label>
                        <div style={styles.inputWrap}>
                            <span style={styles.inputIcon} aria-hidden="true">
                                ••
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Twoje hasło"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={!canSubmit} style={styles.button(canSubmit)}>
                        {isLoading ? (
                            <span style={styles.btnRow}>
                                <span style={styles.spinner} aria-hidden="true" />
                                Logowanie…
                            </span>
                        ) : (
                            'Zaloguj'
                        )}
                    </button>

                    <div style={styles.footerText}>
                        <span style={{ opacity: 0.85 }}>Nie masz jeszcze konta?</span>{' '}
                        <a href="/register" style={styles.link}>
                            Zarejestruj się
                        </a>
                    </div>
                </form>
            </div>

            <div style={styles.bottomHint}>© {new Date().getFullYear()} Twoja aplikacja</div>
        </div>
    );
}
type LoginStyles = {
    page: CSSProperties;
    bgGlow: CSSProperties;
    card: CSSProperties;
    header: CSSProperties;
    brandDot: CSSProperties;
    title: CSSProperties;
    subtitle: CSSProperties;
    alert: CSSProperties;
    alertIcon: CSSProperties;
    form: CSSProperties;
    field: CSSProperties;
    label: CSSProperties;
    inputWrap: CSSProperties;
    inputIcon: CSSProperties;
    input: CSSProperties;
    btnRow: CSSProperties;
    spinner: CSSProperties;
    link: CSSProperties;
    footerText: CSSProperties;
    bottomHint: CSSProperties;
    button: (enabled: boolean) => CSSProperties;
};

const styles: LoginStyles = {

    page: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '28px 16px',
        position: 'relative',
        background:
            'radial-gradient(1200px 700px at 15% 10%, rgba(99,102,241,.28), transparent 60%), radial-gradient(1000px 700px at 85% 30%, rgba(16,185,129,.18), transparent 55%), #0b1020',
        color: '#eaf0ff',
        fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },

    bgGlow: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
            'radial-gradient(900px 500px at 50% 80%, rgba(255,255,255,.08), transparent 60%)',
        filter: 'blur(0px)',
    },

    card: {
        width: 'min(420px, 100%)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,.12)',
        background:
            'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))',
        boxShadow: '0 25px 70px rgba(0,0,0,.55)',
        padding: 18,
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(10px)',
    },

    header: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '8px 8px 14px 8px',
        borderBottom: '1px solid rgba(255,255,255,.10)',
        marginBottom: 14,
    },

    brandDot: {
        width: 42,
        height: 42,
        borderRadius: 14,
        background:
            'linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))',
        boxShadow: '0 10px 30px rgba(99,102,241,.25)',
        flex: '0 0 auto',
    },

    title: {
        margin: 0,
        fontSize: 22,
        fontWeight: 850,
        letterSpacing: '-0.02em',
    },

    subtitle: {
        margin: '4px 0 0 0',
        fontSize: 13,
        color: 'rgba(234,240,255,.75)',
    },

    alert: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid rgba(239,68,68,.35)',
        background: 'rgba(239,68,68,.10)',
        color: 'rgba(255,220,220,1)',
        margin: '10px 4px 14px 4px',
        fontSize: 13,
        lineHeight: 1.25,
    },

    alertIcon: {
        width: 22,
        height: 22,
        borderRadius: 8,
        display: 'grid',
        placeItems: 'center',
        border: '1px solid rgba(239,68,68,.45)',
        background: 'rgba(239,68,68,.18)',
        fontWeight: 900,
        flex: '0 0 auto',
    },

    form: {
        display: 'grid',
        gap: 14,
        padding: '0 4px 6px 4px',
    },

    field: {
        display: 'grid',
        gap: 8,
    },

    label: {
        fontSize: 12,
        color: 'rgba(234,240,255,.72)',
        letterSpacing: '.02em',
    },

    inputWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 12px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,.12)',
        background: 'rgba(255,255,255,.04)',
        transition: 'border-color .15s ease, background .15s ease',
    },

    inputIcon: {
        fontSize: 12,
        color: 'rgba(234,240,255,.60)',
        width: 22,
        textAlign: 'center',
        userSelect: 'none',
    },

    input: {
        width: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: '#eaf0ff',
        fontSize: 14,
        padding: 0,
    },

    button: (enabled: boolean) => ({
        marginTop: 6,
        width: '100%',
        border: '1px solid rgba(255,255,255,.14)',
        borderRadius: 14,
        padding: '12px 14px',
        fontWeight: 800,
        letterSpacing: '.01em',
        color: enabled ? '#081222' : 'rgba(234,240,255,.55)',
        cursor: enabled ? 'pointer' : 'not-allowed',
        background: enabled
            ? 'linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))'
            : 'rgba(255,255,255,.06)',
        boxShadow: enabled ? '0 16px 40px rgba(16,185,129,.12)' : 'none',
        transition: 'transform .06s ease, filter .15s ease',
    }),

    btnRow: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
    },

    spinner: {
        width: 16,
        height: 16,
        borderRadius: 999,
        border: '2px solid rgba(255,255,255,.35)',
        borderTopColor: 'rgba(255,255,255,1)',
        animation: 'spin 0.8s linear infinite',
    },

    link: {
        color: 'rgba(167, 243, 208, 1)',
        textDecoration: 'none',
        fontWeight: 700,
    },

    footerText: {
        marginTop: 6,
        fontSize: 12,
        color: 'rgba(234,240,255,.70)',
        textAlign: 'center',
    },

    bottomHint: {
        position: 'absolute',
        bottom: 16,
        fontSize: 12,
        color: 'rgba(234,240,255,.45)',
        zIndex: 1,
    },
};

// Mały globalny styl animacji spinnera.
// Jeśli masz globalne CSS, przenieś to do pliku css.
const styleElId = '__login_spinner_style__';
if (typeof document !== 'undefined' && !document.getElementById(styleElId)) {
    const style = document.createElement('style');
    style.id = styleElId;
    style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
}
