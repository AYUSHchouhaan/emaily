"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Email {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  labels?: string[];
}

interface EmailContextType {
  emails: Email[];
  setEmails: (emails: Email[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  analyzed: boolean;
  setAnalyzed: (analyzed: boolean) => void;
  clearCache: () => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const clearCache = () => {
    setEmails([]);
    setAnalyzed(false);
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        setEmails,
        loading,
        setLoading,
        analyzed,
        setAnalyzed,
        clearCache,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmails() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmails must be used within an EmailProvider');
  }
  return context;
}
