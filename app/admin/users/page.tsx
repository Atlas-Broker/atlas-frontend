import type { Profile } from '@/lib/supabase/models';
import { getAllUsers } from '@/lib/supabase/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/shared/utils';

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">View and manage platform users</p>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Clerk ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'profit' : 'loss'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateTime(user.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 font-mono">
                        {user.clerk_id.substring(0, 12)}...
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">How to Promote Users</h3>
            <p className="text-sm text-gray-600">
              To change a user&apos;s role, run this SQL command in your Supabase SQL editor:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {`UPDATE profiles SET role = 'admin' WHERE clerk_id = 'user_xxxxx';`}
            </pre>
            <p className="text-sm text-gray-600">
              Replace <code className="bg-gray-100 px-1 rounded">user_xxxxx</code> with the actual Clerk ID from the table above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

