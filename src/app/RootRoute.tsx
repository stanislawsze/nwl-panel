import { Outlet } from 'react-router-dom';

import { AppProviders } from './providers/AppProviders';

export function RootRoute() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
