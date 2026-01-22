import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { isAdmin } from '@/lib/supabase/permissions';
import { Badge } from '@/components/ui/badge';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require admin access
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    redirect('/dashboard');
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo and Links */}
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">Atlas</span>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Admin
                </Badge>
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

            {/* Right: User Button */}
            <div className="flex items-center gap-4">
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

