import { LogOut, MessageCircle, Users, Workflow } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../modules/auth/AuthProvider';
import { TenantSwitcher } from './TenantSwitcher';

const navItems = [
  { to: '/', label: 'Overview', icon: Workflow },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/discord', label: 'Discord', icon: MessageCircle },
];

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">NWL Panel</p>
          <strong>{user?.current_tenant?.name ?? 'No tenant'}</strong>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button
          className="ghost-button"
          onClick={() => void signOut()}
          type="button"
        >
          <LogOut aria-hidden="true" size={18} />
          Sign out
        </button>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <div>
            <span className="muted">Signed in as</span>
            <strong>{user?.email}</strong>
          </div>
          <TenantSwitcher />
        </header>
        <Outlet />
      </div>
    </div>
  );
}
