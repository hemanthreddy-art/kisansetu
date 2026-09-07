'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('KisanSetu App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-red-200 shadow-lg">
        <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-600">
            An unexpected error occurred while loading this section. You can try refreshing or return to the main dashboard.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-700 text-left overflow-x-auto border border-gray-200">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => reset()} variant="primary" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
