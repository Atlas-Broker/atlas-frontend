'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { EnvironmentBadge } from './EnvironmentBadge';
import type { EnvironmentType } from '@/lib/supabase/models';

export interface NavbarProps {
  title?: string;
  environment?: EnvironmentType;
  showEnvironment?: boolean;
}

export function Navbar({ title = 'Atlas', environment = 'paper', showEnvironment = false }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-indigo-600">{title}</span>
            </Link>
            {showEnvironment && (
              <div className="ml-6">
                <EnvironmentBadge environment={environment} showWarning={environment === 'live'} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}

