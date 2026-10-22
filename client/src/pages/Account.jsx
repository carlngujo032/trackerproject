import { PiSignOut } from 'react-icons/pi';
import { useAuth } from '../auth.jsx';

export default function Account() {
  const { user, logout } = useAuth();
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="page-head">
        <h1>Account</h1>
      </header>

      <section className="profile">
        <div className="avatar">{initial}</div>
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.email}</small>
        </div>
      </section>

      <div className="pad">
        <button className="btn danger-outline wide" onClick={logout}>
          <PiSignOut /> Log out
        </button>
      </div>
    </>
  );
}
