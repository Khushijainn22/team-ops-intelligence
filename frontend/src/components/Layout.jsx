import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiGrid, FiFileText, FiUsers, FiCheckSquare, FiCalendar, FiList, FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const navItems = [
  { to: '/', icon: FiGrid, label: 'Dashboard' },
  { to: '/decisions', icon: FiFileText, label: 'Decision Log' },
  { to: '/team', icon: FiUsers, label: 'Team & Capacity' },
  { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { to: '/meetings', icon: FiCalendar, label: 'Meetings' },
  { to: '/actions', icon: FiList, label: 'Action Items' },
];

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {!isSidebarOpen && (
        <button className="sidebar-trigger" onClick={toggleSidebar} aria-label="Open Sidebar">
          <FiMenu />
        </button>
      )}

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
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
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
            <FiChevronLeft />
            <span>Collapse Sidebar</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
