import { setToken } from '@/api/api';
import { register } from '@/api/register';
import { router } from '@inertiajs/react';
import { HTTPError } from 'ky';
import { useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

type ValidationErrors = Record<string, string[]>;

type ErrorResponse = {
    message?: string;
    errors?: ValidationErrors;
};

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const passwordsMatch =
        password.length > 0 && password === passwordConfirmation;

    const passwordMeetsRules = useMemo(() => {
        return (
            password.length >= 8 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[@$!%*?&]/.test(password)
        );
    }, [password]);

    const canSubmit = useMemo(() => {
        return (
            !isLoading &&
            email.trim().length > 0 &&
            password.length > 0 &&
            passwordConfirmation.length > 0 &&
            passwordsMatch &&
            passwordMeetsRules
        );
    }, [
        email,
        password,
        passwordConfirmation,
        isLoading,
        passwordsMatch,
        passwordMeetsRules,
    ]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!passwordMeetsRules) {
            setError(
                'Hasło musi mieć min. 8 znaków oraz zawierać: małą i dużą literę, cyfrę i znak specjalny (@$!%*?&).',
            );
            return;
        }

        setIsLoading(true);

        try {
            const response = await register({
                email: email.trim(),
                password,
                password_confirmation: passwordConfirmation,
            });

            setToken(response.token);
            router.visit('/dashboard', { replace: true });
        } catch (err: unknown) {
            console.error(err);

            if (err instanceof HTTPError) {
                if (err.response.status === 422) {
                    let data: ErrorResponse | null = null;
                    try {
                        data = (await err.response.json()) as ErrorResponse;
                    } catch {
                        // ignore
                    }

                    const firstFieldError = data?.errors
                        ? Object.values(data.errors)[0]?.[0]
                        : null;

                    setError(
                        firstFieldError ??
                        data?.message ??
                        'Błąd walidacji (422).',
                    );
                    return;
                }

                setError(`Błąd serwera (${err.response.status}).`);
                return;
            }

            if (err instanceof Error) {
                setError(err.message);
                return;
            }

            setError('Nie udało się zarejestrować. Spróbuj ponownie.');
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
                        <h1 style={styles.title}>Utwórz konto</h1>
                        <p style={styles.subtitle}>
                            Zarejestruj się, aby przejść dalej.
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={styles.alert} role="alert">
                        <span style={styles.alertIcon}>!</span>
                        <span>{error}</span>
                    </div>
                )}

                {!error && passwordConfirmation.length > 0 && !passwordsMatch && (
                    <div style={styles.hint} role="status">
                        Hasła muszą być takie same.
                    </div>
                )}

                {!error && password.length > 0 && !passwordMeetsRules && (
                    <div style={styles.hint} role="status">
                        Hasło: min. 8 znaków, mała i duża litera, cyfra i znak
                        specjalny (@$!%*?&).
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
                                autoComplete="new-password"
                                placeholder="Utwórz hasło"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label
                            htmlFor="password_confirmation"
                            style={styles.label}
                        >
                            Potwierdź hasło
                        </label>
                        <div style={styles.inputWrap}>
                            <span style={styles.inputIcon} aria-hidden="true">
                                ✓
                            </span>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) =>
                                    setPasswordConfirmation(e.target.value)
                                }
                                required
                                autoComplete="new-password"
                                placeholder="Powtórz hasło"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        style={styles.button(canSubmit)}
                    >
                        {isLoading ? (
                            <span style={styles.btnRow}>
                                <span style={styles.spinner} aria-hidden="true" />
                                Rejestracja…
                            </span>
                        ) : (
                            'Zarejestruj'
                        )}
                    </button>

                    <div style={styles.footerText}>
                        <span style={{ opacity: 0.85 }}>Masz już konto?</span>{' '}
                        <a href="/login" style={styles.link}>
                            Zaloguj się
                        </a>
                    </div>
                </form>
            </div>

            <div style={styles.bottomHint}>
                © {new Date().getFullYear()} Twoja aplikacja
            </div>
        </div>
    );
}

type RegisterStyles = {
    page: CSSProperties;
    bgGlow: CSSProperties;
    card: CSSProperties;
    header: CSSProperties;
    brandDot: CSSProperties;
    title: CSSProperties;
    subtitle: CSSProperties;
    alert: CSSProperties;
    hint: CSSProperties;
    alertIcon: CSSProperties;
    form: CSSProperties;
    field: CSSProperties;
    label: CSSProperties;
    inputWrap: CSSProperties;
    inputIcon: CSSProperties;
    input: CSSProperties;
    button: (enabled: boolean) => CSSProperties;
    btnRow: CSSProperties;
    spinner: CSSProperties;
    link: CSSProperties;
    footerText: CSSProperties;
    bottomHint: CSSProperties;
};

const styles: RegisterStyles = {
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
        margin: '10px 4px 12px 4px',
        fontSize: 13,
        lineHeight: 1.25,
    },

    hint: {
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,.10)',
        background: 'rgba(255,255,255,.05)',
        color: 'rgba(234,240,255,.80)',
        margin: '10px 4px 12px 4px',
        fontSize: 13,
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

const styleElId = '__register_spinner_style__';
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
