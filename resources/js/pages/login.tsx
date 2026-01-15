import { setToken } from '@/api/api';
import { login } from '@/api/login';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await login({ email, password });

            setToken(response.token);

            router.visit('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
            <h1>Login</h1>

            {error && (
                <div
                    style={{
                        color: 'red',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        border: '1px solid red',
                    }}
                >
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                <div>
                    <label
                        htmlFor="email"
                        style={{ display: 'block', marginBottom: '0.5rem' }}
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        style={{ display: 'block', marginBottom: '0.5rem' }}
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '0.75rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
