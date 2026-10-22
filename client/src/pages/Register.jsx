import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiEnvelopeSimple, PiEye, PiEyeSlash, PiLockSimple, PiReceipt, PiUser } from 'react-icons/pi';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    setError('');
    try {
      await register(name, email, password);
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
        <p>Create an account to start tracking your project costs.</p>
      </div>

      <form className="auth-card stack" onSubmit={submit}>
        <h2>Create account</h2>
        <label className="field">
          <span>Name</span>
          <div className="input-icon">
            <PiUser />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required />
          </div>
        </label>
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
            <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" required />
            <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <PiEyeSlash /> : <PiEye />}
            </button>
          </div>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        <p className="switch">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
