import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from './ui/AppLayout';
import { AuthLayout } from './ui/AuthLayout';
import { DashboardPage } from './ui/pages/DashboardPage';
import { DiscordPage } from './ui/pages/DiscordPage';
import { InvitationPage } from './ui/pages/InvitationPage';
import { LoginPage } from './ui/pages/LoginPage';
import { MembersPage } from './ui/pages/MembersPage';
import { RegisterPage } from './ui/pages/RegisterPage';
import { RequireAuth } from './ui/RequireAuth';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/invitations/:token', element: <InvitationPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: '/members', element: <MembersPage /> },
          { path: '/discord', element: <DiscordPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
