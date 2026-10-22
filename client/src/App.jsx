import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { PiReceipt } from 'react-icons/pi';
import { useAuth } from './auth.jsx';
import BottomNav from './components/BottomNav.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Account from './pages/Account.jsx';

function Splash() {
  const { slow } = useAuth();
  return (
    <div className="splash">
      <div className="brand-tile">
        <PiReceipt />
      </div>
      <p>{slow ? 'Waking up the server. This can take a moment.' : 'Loading Partlog'}</p>
    </div>
  );
}

function RequireAuth() {
  const { user, ready } = useAuth();
  if (!ready) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app">
      <main className="screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <Splash />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/account" element={<Account />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
