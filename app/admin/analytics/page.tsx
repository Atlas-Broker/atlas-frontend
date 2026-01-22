import type { Order, Profile } from '@/lib/supabase/models';
import { getAllOrders, getAllUsers } from '@/lib/supabase/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default async function AdminAnalyticsPage() {
  const allOrders = await getAllOrders();
  const users = await getAllUsers();

  // Calculate analytics
  const ordersByStatus = allOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ordersByEnvironment = allOrders.reduce((acc, order) => {
    acc[order.environment] = (acc[order.environment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top symbols
  const symbolStats = allOrders.reduce((acc, order) => {
    if (!acc[order.symbol]) {
      acc[order.symbol] = { count: 0, volume: 0 };
    }
    acc[order.symbol].count += 1;
    acc[order.symbol].volume += order.quantity;
    return acc;
  }, {} as Record<string, { count: number; volume: number }>);

  const topSymbols = Object.entries(symbolStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  // User engagement
  const activeUsers = new Set(allOrders.map(o => o.user_id)).size;
  const avgOrdersPerUser = users.length > 0 ? (allOrders.length / users.length).toFixed(1) : 0;

  // Autonomy level distribution (mock for now)
  const autonomyDistribution = {
    0: 0,
    1: users.length, // Default is level 1
    2: 0,
    3: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform insights and statistics</p>
      </div>

      {/* Trading Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Paper Trading</p>
              <p className="text-2xl font-bold text-green-600">
                {ordersByEnvironment['paper'] || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Live Trading</p>
              <p className="text-2xl font-bold text-red-600">
                {ordersByEnvironment['live'] || 0}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">{status}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Symbols */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Most Traded Symbols</CardTitle>
        </CardHeader>
        <CardContent>
          {topSymbols.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No trading activity yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Order Count</TableHead>
                  <TableHead>Total Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSymbols.map(([symbol, stats], index) => (
                  <TableRow key={symbol}>
                    <TableCell>
                      <Badge variant="default">#{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{symbol}</TableCell>
                    <TableCell>{stats.count} orders</TableCell>
                    <TableCell>{stats.volume.toLocaleString()} shares</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Users who placed orders</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg Orders Per User</p>
              <p className="text-2xl font-bold text-gray-900">{avgOrdersPerUser}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Autonomy Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Autonomy Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Observer (Level 0)</p>
              <p className="text-2xl font-bold text-gray-900">{autonomyDistribution[0]}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Copilot (Level 1)</p>
              <p className="text-2xl font-bold text-blue-900">{autonomyDistribution[1]}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Guarded Auto (Level 2)</p>
              <p className="text-2xl font-bold text-yellow-900">{autonomyDistribution[2]}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Full Auto (Level 3)</p>
              <p className="text-2xl font-bold text-red-900">{autonomyDistribution[3]}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

