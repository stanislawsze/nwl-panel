import { Outlet } from 'react-router-dom';

import { config } from '../config';

export function AuthLayout() {
  return (
    <main className="auth-shell">
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
