'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              💬 Chat
            </Link>
            <Link
              href="/rules"
              className="px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Manage Rules
            </Link>
            <Link
              href="/settings"
              className="px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              ⚙️ Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
