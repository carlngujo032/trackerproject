import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PiFolders, PiFoldersFill, PiPlusCircle, PiUserCircle, PiUserCircleFill } from 'react-icons/pi';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onAccount = pathname.startsWith('/account');
  const onProjects = !onAccount;

  return (
    <nav className="bottom-nav" aria-label="Main">
      <NavLink to="/" end={false} className={`nav-item${onProjects ? ' active' : ''}`}>
        {onProjects ? <PiFoldersFill /> : <PiFolders />}
        <span>Projects</span>
      </NavLink>

      <button type="button" className="nav-item" onClick={() => navigate('/?new=1')}>
        <PiPlusCircle />
        <span>New project</span>
      </button>

      <NavLink to="/account" className={`nav-item${onAccount ? ' active' : ''}`}>
        {onAccount ? <PiUserCircleFill /> : <PiUserCircle />}
        <span>Account</span>
      </NavLink>
    </nav>
  );
}
