import { jwtDecode } from 'jwt-decode';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

type LoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

type JwtPayload = {
    user_id: number;
    exp: number;
};

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        defaultValues: { username: '', password: '', remember: false },
    });

    async function login(data: LoginForm) {
        setIsLoading(true);
        setServerError(null);
        try {
            const res = await axios.post('http://localhost:8000/auth/login', {
                username: data.username,
                password: data.password,
            });
            const token: string = res.data['access_token'];
            if (token) {
                const storage = data.remember ? localStorage : sessionStorage;
                storage.setItem('access_token', token);
                const payload = jwtDecode<JwtPayload>(token);
                navigate(`/newgame/${payload.user_id}`);
            }
        } catch (err: any) {
            setServerError(
                err?.response?.data?.detail ?? 'Incorrect username or password.'
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f6f4f0;
          --surface: #ffffff;
          --border: #e4e0d8;
          --border-focus: #2a7c5f;
          --text-primary: #18181b;
          --text-secondary: #71717a;
          --text-muted: #a1a1aa;
          --accent: #2a7c5f;
          --accent-hover: #236b51;
          --accent-light: rgba(42,124,95,0.08);
          --error: #c0392b;
          --error-bg: #fdf2f2;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --radius-sm: 8px;
        }

        .l-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg);
          font-family: 'Sora', sans-serif;
        }

        /* ── Left panel ── */
        .l-left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          background: var(--accent);
          position: relative;
          overflow: hidden;
        }

        .l-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 10%, rgba(255,255,255,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .l-left::after {
          content: '';
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          bottom: -160px;
          right: -120px;
        }

        .l-left-inner {
          position: relative;
          z-index: 1;
        }

        .l-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .l-brand-icon { font-size: 1.5rem; line-height: 1; }

        .l-brand-name {
          font-family: 'Instrument Serif', serif;
          font-size: 1.4rem;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .l-left-headline {
          margin-top: 4rem;
        }

        .l-left-headline h2 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 400;
          font-style: italic;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .l-left-headline p {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 300px;
          font-weight: 300;
        }

        .l-features {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-top: 2.5rem;
        }

        .l-feature {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.8);
        }

        .l-feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          flex-shrink: 0;
        }

        .l-left-footer {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
          position: relative;
          z-index: 1;
        }

        /* ── Right panel ── */
        .l-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .l-form-wrapper {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .l-form-header { margin-bottom: 2.2rem; }

        .l-welcome {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 0.6rem;
        }

        .l-form-title {
          font-family: 'Instrument Serif', serif;
          font-size: 2.2rem;
          font-weight: 400;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .l-form-subtitle {
          margin-top: 0.5rem;
          font-size: 0.83rem;
          color: var(--text-muted);
          font-weight: 300;
        }

        .l-field { margin-bottom: 1.1rem; }

        .l-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.45rem;
          letter-spacing: 0.01em;
        }

        .l-input-wrap { position: relative; }

        .l-input {
          width: 100%;
          padding: 0.78rem 1rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          font-family: 'Sora', sans-serif;
          font-size: 0.88rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-shadow: var(--shadow-sm);
        }

        .l-input::placeholder { color: var(--text-muted); }

        .l-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-light);
        }

        .l-input--error {
          border-color: var(--error) !important;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.09) !important;
        }

        .l-input--pr { padding-right: 3rem; }

        .l-eye-btn {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color 0.15s;
        }
        .l-eye-btn:hover { color: var(--text-secondary); }

        .l-field-error {
          margin-top: 0.3rem;
          font-size: 0.73rem;
          color: var(--error);
        }

        .l-server-error {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          padding: 0.75rem 0.9rem;
          background: var(--error-bg);
          border: 1.5px solid rgba(192,57,43,0.18);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--error);
          margin-bottom: 1.2rem;
          line-height: 1.5;
        }

        .l-remember {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 1.6rem;
        }

        .l-checkbox {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .l-remember-label {
          font-size: 0.82rem;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }

        .l-btn {
          width: 100%;
          padding: 0.88rem 1rem;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-family: 'Sora', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(42,124,95,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .l-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          box-shadow: 0 4px 16px rgba(42,124,95,0.35);
          transform: translateY(-1px);
        }

        .l-btn:active:not(:disabled) { transform: translateY(0); }

        .l-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .l-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .l-form-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        @media (max-width: 720px) {
          .l-root { grid-template-columns: 1fr; }
          .l-left { display: none; }
          .l-right { padding: 2rem 1.25rem; align-items: flex-start; padding-top: 3rem; }
        }
      `}</style>

            <div className="l-root w-full">

                {/* Left decorative panel */}
                <div className="l-left">
                    <div className="l-left-inner">
                        <div className="l-brand">
                            <span className="l-brand-icon">🎩</span>
                            <span className="l-brand-name">Monopoly</span>
                        </div>

                        <div className="l-left-headline">
                            <h2>Roll the dice,<br />own the board.</h2>
                            <p>
                                Jump back into your game. Properties, deals,
                                and rivalries are waiting for you.
                            </p>

                            <div className="l-features">
                                {['Real-time multiplayer', 'Live game chat', 'Auction & bidding system'].map(f => (
                                    <div className="l-feature" key={f}>
                                        <div className="l-feature-dot" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="l-left-footer">© 2025 Monopoly Online</div>
                </div>

                {/* Right form panel */}
                <div className="l-right">
                    <div className="l-form-wrapper">

                        <div className="l-form-header">
                            <p className="l-welcome">Welcome back</p>
                            <h1 className="l-form-title">Sign in to<br />your account</h1>
                            <p className="l-form-subtitle">Enter your credentials to continue</p>
                        </div>

                        {serverError && (
                            <div className="l-server-error">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(login)} noValidate>

                            {/* Username */}
                            <div className="l-field">
                                <label className="l-label" htmlFor="username">Username</label>
                                <div className="l-input-wrap">
                                    <input
                                        id="username"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="your_username"
                                        className={`l-input${errors.username ? ' l-input--error' : ''}`}
                                        {...register('username', { required: 'Username is required' })}
                                    />
                                </div>
                                {errors.username && <p className="l-field-error">{errors.username.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="l-field">
                                <label className="l-label" htmlFor="password">Password</label>
                                <div className="l-input-wrap">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className={`l-input l-input--pr${errors.password ? ' l-input--error' : ''}`}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 4, message: 'Minimum 4 characters' },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="l-eye-btn"
                                        onClick={() => setShowPassword(v => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="l-field-error">{errors.password.message}</p>}
                            </div>

                            {/* Remember me */}
                            <div className="l-remember">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="l-checkbox"
                                    {...register('remember')}
                                />
                                <label htmlFor="remember" className="l-remember-label">
                                    Keep me signed in
                                </label>
                            </div>

                            <button type="submit" className="l-btn" disabled={isLoading}>
                                {isLoading && <span className="l-spinner" />}
                                {isLoading ? 'Signing in…' : 'Sign In'}
                            </button>

                        </form>

                        <p className="l-form-footer">Secure connection · Sessions are encrypted</p>
                    </div>
                </div>
            </div>
        </>
    );
}