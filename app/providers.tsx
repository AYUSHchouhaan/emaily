'use client';

import { SessionProvider } from 'next-auth/react';
import { EmailProvider } from '@/contexts/EmailContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <EmailProvider>
        {children}
      </EmailProvider>
    </SessionProvider>
  );
}
