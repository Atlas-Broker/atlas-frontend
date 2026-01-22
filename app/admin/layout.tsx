import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { getUserProfile } from '@/lib/supabase/permissions';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { ViewSwitcher } from '@/components/shared/ViewSwitcher';
import { Shield } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require admin access
  const profile = await getUserProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    redirect('/dashboard');
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Fixed with proper layering */}
      <nav className="glass border-b sticky top-0 z-50 backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo and Links */}
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-xl font-bold gradient-orange bg-clip-text text-transparent">
                  Atlas
                </span>
                <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                  Admin
                </Badge>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: View Switcher, Role Badge, Theme Toggle and User Button */}
            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <ViewSwitcher role={profile.role} />
              
              {/* Role Badge */}
              <div className="hidden sm:block">
                <RoleBadge role={profile.role} />
              </div>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Button */}
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex gap-4 pb-3 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary whitespace-nowrap transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content - Proper z-index layering */}
      <main className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

