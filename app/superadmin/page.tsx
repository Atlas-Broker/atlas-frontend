import { getAllUsers } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default async function SuperAdminDashboardPage() {
  const users = await getAllUsers();
  
  const adminUsers = users.filter(u => u.role === 'admin');
  const superAdminUsers = users.filter(u => u.role === 'superadmin');
  const traderUsers = users.filter(u => u.role === 'trader');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
        <p className="text-gray-500 mt-1">System-wide control and management</p>
      </div>

      {/* View Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Switch to Trader View
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Switch to Admin View
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">SuperAdmins</p>
                <p className="text-3xl font-bold text-gray-900">{superAdminUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Admins</p>
                <p className="text-3xl font-bold text-gray-900">{adminUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Traders</p>
                <p className="text-3xl font-bold text-gray-900">{traderUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {adminUsers.length === 0 && superAdminUsers.length <= 1 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No other admins or superadmins yet</p>
                <p className="text-sm text-gray-600">
                  Use the SQL command below to promote users to admin
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Traders Managed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...superAdminUsers, ...adminUsers].map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'success' : 'danger'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateTime(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          0 traders (coming soon)
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Management Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Promote User to Admin</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`UPDATE profiles SET role = 'admin' WHERE clerk_id = 'user_xxxxx';`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Promote User to SuperAdmin</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`UPDATE profiles SET role = 'superadmin' WHERE clerk_id = 'user_xxxxx';`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Demote User to Trader</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`UPDATE profiles SET role = 'trader' WHERE clerk_id = 'user_xxxxx';`}
              </pre>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-900 font-medium mb-1">⚠️ Important</p>
              <p className="text-sm text-yellow-700">
                Run these commands in your Supabase SQL editor. Get the clerk_id from the Admin Users page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Configuration (Mock) */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Global Risk Limits</p>
              <p className="font-semibold text-gray-900">Default Settings</p>
              <p className="text-xs text-gray-500 mt-1">Coming in future phases</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Feature Flags</p>
              <p className="font-semibold text-gray-900">Phase 1 Config</p>
              <p className="text-xs text-gray-500 mt-1">Coming in future phases</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

