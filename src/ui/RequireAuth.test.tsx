import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '../app/providers/AppProviders';
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
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    expect(await screen.findByText('Sign in page')).toBeInTheDocument();
  });
});
