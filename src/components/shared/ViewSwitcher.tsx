'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, User } from 'lucide-react';
import type { UserRole } from '@/lib/supabase/models';
import { cn } from '@/lib/shared/utils';

export interface ViewSwitcherProps {
  role: UserRole;
}

export function ViewSwitcher({ role }: ViewSwitcherProps) {
  const pathname = usePathname();
  const isAdminView = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');

  // Only show switcher for admin and superadmin
  if (role !== 'admin' && role !== 'superadmin') {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border">
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          !isAdminView
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Trader</span>
      </Link>
      <Link
        href="/admin"
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          isAdminView
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Admin</span>
      </Link>
    </div>
  );
}
