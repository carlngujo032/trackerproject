import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiEnvelopeSimple, PiEye, PiEyeSlash, PiLockSimple, PiReceipt } from 'react-icons/pi';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-top">
        <div className="brand-tile"><PiReceipt /></div>
        <h1>Partlog</h1>
        <p>Keep every part and price for the things you build.</p>
      </div>

      <form className="auth-card stack" onSubmit={submit}>
        <h2>Log in</h2>
        <label className="field">
          <span>Email</span>
          <div className="input-icon">
            <PiEnvelopeSimple />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </div>
        </label>
        <label className="field">
          <span>Password</span>
          <div className="input-icon">
            <PiLockSimple />
            <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required />
            <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <PiEyeSlash /> : <PiEye />}
            </button>
          </div>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        <p className="switch">No account yet? <Link to="/register">Create one</Link></p>
      </form>
    </div>
  );
}
