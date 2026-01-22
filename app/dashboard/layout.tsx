import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { getUserProfile } from '@/lib/supabase/permissions';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, List, TrendingUp, Settings, FileText, TrendingDown } from 'lucide-react';
import { ToastProvider } from '@/components/ui/toast';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authentication
  const profile = await getUserProfile();
  if (!profile) {
    redirect('/sign-in');
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/watchlist', label: 'Watchlist', icon: List },
    { href: '/dashboard/orders', label: 'Orders', icon: FileText },
    { href: '/dashboard/positions', label: 'Positions', icon: TrendingUp },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <nav className="glass border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo and Links */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold gradient-orange bg-clip-text text-transparent">
                  Atlas
                </span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Environment Badge, Theme Toggle and User Button */}
            <div className="flex items-center gap-3">
              <Badge variant="paper">Paper Trading</Badge>
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-2 pb-3 overflow-x-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

