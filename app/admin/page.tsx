import type { Order, AuditLog, Profile } from '@/lib/supabase/models';
import { getAllUsers, getAllOrders, getRecentAuditLogs } from '@/lib/supabase/queries';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, toTitleCase } from '@/lib/shared/utils';

export default async function AdminDashboardPage() {
  const users = await getAllUsers();
  const allOrders = await getAllOrders({ limit: 100 });
  const auditLogs = await getRecentAuditLogs(10);

  // Get today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today);

  // Get top symbols
  const symbolCounts = allOrders.reduce((acc, order) => {
    acc[order.symbol] = (acc[order.symbol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSymbols = Object.entries(symbolCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and metrics</p>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Active Traders Today"
          value={todayOrders.length > 0 ? new Set(todayOrders.map(o => o.user_id)).size : 0}
          description="Users with orders today"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatsCard
          title="Total Orders Today"
          value={todayOrders.length}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="System Status"
          value="Operational"
          description="All systems running"
          icon={
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        No activity yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="default">{toTitleCase(log.action)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {toTitleCase(log.resource_type)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTime(log.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Symbols */}
        <Card>
          <CardHeader>
            <CardTitle>Most Traded Symbols</CardTitle>
          </CardHeader>
          <CardContent>
            {topSymbols.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No trading activity yet</p>
            ) : (
              <div className="space-y-3">
                {topSymbols.map(([symbol, count], index) => (
                  <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-900">{symbol}</span>
                    </div>
                    <Badge variant="default">{count} orders</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Traders</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'trader').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

