'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleDashboardClick = () => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else {
      alert('Please sign in first to access the dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8 text-black tracking-tight">
          Emaily
        </h1>
        <p className="text-lg mb-12 text-gray-600">
          Powerful email assistant for your workflow
        </p>
        <div className="flex gap-4 justify-center items-center">
          <Link
            href="/auth"
            className="inline-block px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
          <button
            onClick={handleDashboardClick}
            className="inline-block px-8 py-4 border-2 border-black text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Dashboard
          </button>
        </div>
        {status === 'authenticated' && (
          <p className="mt-6 text-sm text-gray-500">
            Signed in as {session?.user?.email}
          </p>
        )}
      </div>
    </div>
  );
}
