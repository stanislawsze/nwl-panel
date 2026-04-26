import { IconButton, Tooltip } from '@mui/material';
import {
  LogOut,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  Workflow,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../modules/auth/AuthProvider';
import { useTenantPermissions } from '../shared/auth/permissions';
import { useColorMode } from '../shared/theme/ColorModeProvider';
import { TenantSwitcher } from './TenantSwitcher';

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { canViewAuditLogs, canViewUsers } = useTenantPermissions();
  const { mode, toggleMode } = useColorMode();
  const navItems = [
    { to: '/', label: 'Overview', icon: Workflow, visible: true },
    { to: '/members', label: 'Members', icon: Users, visible: canViewUsers },
    {
      to: '/audit',
      label: 'Audit',
      icon: ShieldCheck,
      visible: canViewAuditLogs,
    },
    { to: '/discord', label: 'Discord', icon: MessageCircle, visible: true },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">NWL Panel</p>
          <strong>{user?.current_tenant?.name ?? 'No tenant'}</strong>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
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
          <div className="topbar-actions">
            <TenantSwitcher />
            <Tooltip
              title={
                mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              <IconButton aria-label="Toggle color mode" onClick={toggleMode}>
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
            </Tooltip>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
