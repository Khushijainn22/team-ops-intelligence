import { NavLink, Outlet } from 'react-router-dom';
import { FiGrid, FiFileText, FiUsers, FiCheckSquare, FiCalendar, FiList } from 'react-icons/fi';

const navItems = [
  { to: '/', icon: FiGrid, label: 'Dashboard' },
  { to: '/decisions', icon: FiFileText, label: 'Decision Log' },
  { to: '/team', icon: FiUsers, label: 'Team & Capacity' },
  { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { to: '/meetings', icon: FiCalendar, label: 'Meetings' },
  { to: '/actions', icon: FiList, label: 'Action Items' },
];

function Layout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">
            <span className="sidebar-logo-word">Team</span>
            <span className="sidebar-logo-word sidebar-logo-word-accent">Ops</span>
          </span>
          <p className="sidebar-logo-tagline">Decision Intelligence Platform</p>
        </div>
        <ul className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
                <Icon /> {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
