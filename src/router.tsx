import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppProviders } from './app/providers/AppProviders';
import { RootRoute } from './app/RootRoute';
import { AppErrorBoundary } from './ui/AppErrorBoundary';
import { RequireAuth } from './ui/RequireAuth';

export const router = createBrowserRouter([
  {
    element: <RootRoute />,
    errorElement: (
      <AppProviders>
        <AppErrorBoundary />
      </AppProviders>
    ),
    children: [
      {
        lazy: async () => {
          const { AuthLayout } = await import('./ui/AuthLayout');

          return { Component: AuthLayout };
        },
        children: [
          {
            path: '/login',
            lazy: async () => {
              const { LoginPage } = await import('./ui/pages/LoginPage');

              return { Component: LoginPage };
            },
          },
          {
            path: '/register',
            lazy: async () => {
              const { RegisterPage } = await import('./ui/pages/RegisterPage');

              return { Component: RegisterPage };
            },
          },
          {
            path: '/invitations/:token',
            lazy: async () => {
              const { InvitationPage } =
                await import('./ui/pages/InvitationPage');

              return { Component: InvitationPage };
            },
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            lazy: async () => {
              const { AppLayout } = await import('./ui/AppLayout');

              return { Component: AppLayout };
            },
            children: [
              {
                index: true,
                lazy: async () => {
                  const { DashboardPage } =
                    await import('./ui/pages/DashboardPage');

                  return { Component: DashboardPage };
                },
              },
              {
                path: '/members',
                lazy: async () => {
                  const { MembersPage } =
                    await import('./ui/pages/MembersPage');

                  return { Component: MembersPage };
                },
              },
              {
                path: '/audit',
                lazy: async () => {
                  const { AuditLogPage } =
                    await import('./ui/pages/AuditLogPage');

                  return { Component: AuditLogPage };
                },
              },
              {
                path: '/discord',
                lazy: async () => {
                  const { DiscordPage } =
                    await import('./ui/pages/DiscordPage');

                  return { Component: DiscordPage };
                },
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
