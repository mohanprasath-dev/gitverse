'use client';

import Link from 'next/link';
import { CosmicButton } from '@gitverse/ui';

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="mb-2 text-2xl font-bold text-red-400">Authentication Error</h1>
        <p className="mb-6 text-sm text-white/50">
          Something went wrong during sign in. Please try again.
        </p>
        <Link href="/auth/signin">
          <CosmicButton variant="primary">Try Again</CosmicButton>
        </Link>
      </div>
    </main>
  );
}
