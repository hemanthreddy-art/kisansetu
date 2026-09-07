import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-md">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Error 404
          </span>
          <h2 className="text-2xl font-black text-gray-900">Page Not Found</h2>
          <p className="text-sm text-gray-600">
            The market route or page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" className="gap-2">
              <Home className="w-4 h-4" />
              <span>Return to KisanSetu Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
