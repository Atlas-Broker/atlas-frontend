'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  links: SidebarLink[];
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export function Sidebar({ links, stats }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all z-30',
          'lg:relative lg:top-0',
          isCollapsed ? 'w-0 lg:w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {link.icon && <span className="flex-shrink-0">{link.icon}</span>}
                  {!isCollapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {stats && !isCollapsed && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-4 p-2 rounded-md hover:bg-gray-100 text-gray-500 hidden lg:block"
          >
            <svg
              className={cn('h-5 w-5 transition-transform', isCollapsed && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg lg:hidden z-40"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </>
  );
}

