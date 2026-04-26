import { Outlet } from 'react-router-dom';

import { config } from '../config';
import { useColorMode } from '../shared/theme/ColorModeProvider';

export function AuthLayout() {
  const { mode, toggleMode } = useColorMode();

  return (
    <main className="auth-shell">
      <button className="mode-toggle" onClick={toggleMode} type="button">
        {mode === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
      <section className="auth-panel" aria-label={config.appName}>
        <div>
          <p className="eyebrow">NWL operations</p>
          <h1>{config.appName}</h1>
          <p className="muted">
            Control tenants, staff access, invitations, and integrations from
            one quiet console.
          </p>
        </div>
        <Outlet />
      </section>
    </main>
  );
}
