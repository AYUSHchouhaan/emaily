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
    <main className="min-h-screen bg-white text-black">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-bold tracking-tight">Emaily</Link>
        <Link href="/auth" className="text-sm font-medium hover:underline">Sign in</Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Your inbox, understood
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Turn email overload into clear next steps.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Emaily is an AI-powered Gmail assistant that organizes your messages, highlights what matters, and lets you ask questions about your inbox in plain English.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/auth" className="rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800">
              Get started
            </Link>
            <button onClick={handleDashboardClick} className="rounded-lg border border-black px-6 py-3 font-medium transition-colors hover:bg-gray-100">
              Open dashboard
            </button>
          </div>
          {status === 'authenticated' && (
            <p className="mt-5 text-sm text-gray-500">Signed in as {session?.user?.email}</p>
          )}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-px px-6 py-16 sm:grid-cols-3">
          <div className="bg-gray-50 py-4 sm:pr-10">
            <p className="mb-3 text-sm font-semibold text-gray-500">01</p>
            <h2 className="text-xl font-semibold">Connect Gmail</h2>
            <p className="mt-3 leading-7 text-gray-600">Bring your inbox into one focused workspace without manually sorting every message.</p>
          </div>
          <div className="bg-gray-50 py-4 sm:px-10">
            <p className="mb-3 text-sm font-semibold text-gray-500">02</p>
            <h2 className="text-xl font-semibold">Analyze with AI</h2>
            <p className="mt-3 leading-7 text-gray-600">Automatically identify useful categories and group related email so priorities are easier to scan.</p>
          </div>
          <div className="bg-gray-50 py-4 sm:pl-10">
            <p className="mb-3 text-sm font-semibold text-gray-500">03</p>
            <h2 className="text-xl font-semibold">Ask your inbox</h2>
            <p className="mt-3 leading-7 text-gray-600">Use chat to summarize recent mail, find work messages, or answer questions about your emails.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl bg-black px-8 py-10 text-white sm:flex sm:items-center sm:justify-between sm:px-12">
          <div>
            <h2 className="text-2xl font-semibold">Spend less time searching.</h2>
            <p className="mt-2 text-gray-300">Let Emaily make your inbox actionable.</p>
          </div>
          <Link href="/auth" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-gray-200 sm:mt-0">Try Emaily</Link>
        </div>
      </section>
    </main>
  );
}
