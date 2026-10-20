import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import './modern-stunning-sign-in.css';

const avatars = [
  '/images/auth-avatars/purple-hair.webp',
  '/images/auth-avatars/black-hair.jpg',
  '/images/auth-avatars/blue-eyes.webp',
  '/images/auth-avatars/pink-hair.png',
];

export function SignIn1({ onClose }: { onClose?: () => void } = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [signUp, setSignUp] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const codeInput = useRef<HTMLInputElement>(null);
  const successTitle = useRef<HTMLHeadingElement>(null);
  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (step === 'success') successTitle.current?.focus();
    if (!signUp || step !== 'form' || !expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step, signUp, expiresAt]);

  function sendDemoCode() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address first.');
      return;
    }
    if (Date.now() < resendAt) return;
    const time = Date.now();
    setNow(time);
    setResendAt(time + 60000);
    setExpiresAt(time + 600000);
    setNotice('Demo code: 123456. Valid for 10 minutes. No email is sent.');
    codeInput.current?.focus();
    setCode('');
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signUp && password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (signUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signUp) {
      if (!expiresAt) {
        setError('Get an email verification code first.');
        return;
      }
      if (Date.now() >= expiresAt) {
        setError('This demo code has expired. Request a new code.');
        return;
      }
      if (code !== '123456') {
        setError('Enter the 6-digit demo code: 123456.');
        return;
      }
      setError('');
      setPassword('');
      setConfirmPassword('');
      setCode('');
      setEmail(email.trim());
      setStep('success');
      return;
    }
    setError('');
    setPassword('');
    setNotice('Demo only — no account was created or authenticated. You can explore Projects below.');
  }

  return <div className={`cimora-auth${onClose ? ' cimora-auth--modal' : ''}`}>
    {onClose ? <button type="button" className="auth-close" aria-label="Close sign in" onClick={onClose}>×</button> : <a className="auth-home" href="/">← Back to home</a>}
    <section className="auth-card" aria-labelledby="auth-title">
      <a href="/" className="auth-logo" aria-label="Cimora Studio home"><img src="/favicon.svg" alt="" /></a>
      <h1 id="auth-title">Cimora Studio</h1>
      {step === 'success' ? <div className="auth-verification">
        <h2 ref={successTitle} tabIndex={-1}>Email verified</h2>
        <p>Registration preview complete for <strong>{email}</strong>.</p>
        <p>This is a demo. No email was sent and no account was created.</p>
        <a className="auth-submit auth-project-link" href="/projects">Continue to Projects →</a>
        <p className="auth-switch"><button type="button" onClick={() => { setStep('form'); setSignUp(false); }}>Back to sign in</button></p>
      </div> : <form onSubmit={submit} noValidate>
        <div className="auth-fields">
          <label className="auth-sr-only" htmlFor="auth-email">Email</label>
          <input id="auth-email" name="email" placeholder="Email" type="email" autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setExpiresAt(0); setResendAt(0); setCode(''); setNotice(''); setError(''); }} aria-describedby={error ? 'auth-error' : undefined} />
          {signUp && <>
            <label className="auth-code-label" htmlFor="auth-code">Email verification code</label>
            <div className="auth-code-row">
              <input ref={codeInput} id="auth-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} aria-describedby="auth-code-hint" />
              <button type="button" className="auth-send-code" disabled={secondsLeft > 0} onClick={sendDemoCode}>{secondsLeft > 0 ? `${secondsLeft}s` : expiresAt ? 'Resend code' : 'Get code'}</button>
            </div>
            <p id="auth-code-hint" className="auth-password-hint">Demo only · Get a code to verify your email.</p>
          </>}
          <label className="auth-sr-only" htmlFor="auth-password">Password</label>
          <input id="auth-password" name="password" placeholder="Password" type="password" autoComplete={signUp ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} aria-describedby={error ? 'auth-error' : undefined} />
          {signUp && <>
            <p className="auth-password-hint">Use at least 8 characters.</p>
            <label className="auth-sr-only" htmlFor="auth-confirm-password">Confirm password</label>
            <input id="auth-confirm-password" name="confirmPassword" placeholder="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} aria-describedby={error ? 'auth-error' : undefined} />
          </>}
          {error && <p className="auth-error" id="auth-error" role="alert">{error}</p>}
        </div>
        <hr />
        <button className="auth-submit" type="submit">{signUp ? 'Sign up' : 'Sign in'}</button>
        <button className="auth-google" type="button" onClick={() => { setError(''); setNotice('Google sign-in is not connected in this preview.'); }}>
          <img src="https://cdn.21st.dev/assets/mirror/38/38146bfd9eff6dbf0d74771f2e625c70d87d3770e0d080dbb6e50db1d5403f46.svg" alt="" />Continue with Google
        </button>
        <p className="auth-switch">{signUp ? 'Already have an account? ' : "Don't have an account? "}<button type="button" onClick={() => { setSignUp(!signUp); setError(''); setNotice(''); setPassword(''); setConfirmPassword(''); setCode(''); setExpiresAt(0); setResendAt(0); }}>{signUp ? 'Sign in' : "Sign up, it’s free!"}</button></p>
        {notice && <p className="auth-notice" role="status">{notice}</p>}
      </form>}
    </section>
    <div className="auth-community">
      <p>Bring your next <strong>anime</strong> to life with Cimora Studio.</p>
      <div className="auth-avatars" aria-label="Creative community">{avatars.map(src => <img key={src} src={src} alt="" />)}</div>
    </div>
    <p className="auth-preview">Demo preview · Authentication coming soon.<br /><a href="/projects">Explore Projects →</a></p>
  </div>;
}

export default SignIn1;
