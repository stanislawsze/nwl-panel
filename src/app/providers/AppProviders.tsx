import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { AuthProvider } from '../../modules/auth/AuthProvider';
import { FeedbackProvider } from '../../shared/feedback/FeedbackProvider';
import { ColorModeProvider } from '../../shared/theme/ColorModeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider>
        <FeedbackProvider>
          <AuthProvider>{children}</AuthProvider>
        </FeedbackProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  );
}
