import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { getUserProfile } from '@/lib/permissions';
import { EnvironmentBadge } from '@/components/shared/EnvironmentBadge';

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
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/watchlist', label: 'Watchlist' },
    { href: '/dashboard/orders', label: 'Orders' },
    { href: '/dashboard/positions', label: 'Positions' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo and Links */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">Atlas</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Environment Badge and User Button */}
            <div className="flex items-center gap-4">
              <EnvironmentBadge environment="paper" />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-4 pb-3 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 whitespace-nowrap transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

