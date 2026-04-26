import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '../modules/auth/AuthProvider';
import { RequireAuth } from './RequireAuth';

describe('RequireAuth', () => {
  it('redirects unauthenticated users to sign in', async () => {
    window.localStorage.clear();

    const router = createMemoryRouter(
      [
        {
          element: <RequireAuth />,
          children: [{ path: '/', element: <div>Private</div> }],
        },
        { path: '/login', element: <div>Sign in page</div> },
      ],
      { initialEntries: ['/'] },
    );

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    );

    expect(await screen.findByText('Sign in page')).toBeInTheDocument();
  });
});
