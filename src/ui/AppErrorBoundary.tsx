import { Button } from '@mui/material';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export function AppErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'The panel could not render this screen.';

  return (
    <main className="screen-message gap-4 p-6 text-center">
      <div className="grid max-w-lg gap-3">
        <p className="eyebrow">Application error</p>
        <h1>Something broke in this view</h1>
        <p className="muted">{message}</p>
        <Button component={Link} to="/" variant="contained">
          Back to overview
        </Button>
      </div>
    </main>
  );
}
