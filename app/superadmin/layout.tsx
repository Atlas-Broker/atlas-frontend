import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { isSuperAdmin } from '@/lib/supabase/permissions';
import { Badge } from '@/components/ui/badge';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require superadmin access
  const hasSuperAdminAccess = await isSuperAdmin();
  if (!hasSuperAdminAccess) {
    redirect('/dashboard');
  }

  const navLinks = [
    { href: '/superadmin', label: 'Dashboard' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo and Links */}
            <div className="flex items-center gap-8">
              <Link href="/superadmin" className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">Atlas</span>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  SuperAdmin
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
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

