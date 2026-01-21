import { getUserProfile } from '@/lib/permissions';
import { getUserOrders, getUserPositions } from '@/lib/supabase';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency, formatDateTime, getOrderStatusColor, toTitleCase, getAutonomyLevelLabel } from '@/lib/utils';
import { EmptyState, EmptyIcon } from '@/components/shared/EmptyState';

export default async function DashboardPage() {
  const profile = await getUserProfile();
  
  if (!profile) {
    return null; // Layout will handle redirect
  }

  // Fetch recent orders and positions
  const orders = await getUserOrders(profile.id, { limit: 5 });
  const positions = await getUserPositions(profile.id, 'paper');
  const pendingOrders = orders.filter(o => o.status === 'proposed');

  // Mock data for portfolio
  const portfolioValue = 50000;
  const todayPnL = 234.50;
  const todayPnLPercent = 0.47;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile.full_name || 'Trader'}
        </h1>
        <p className="text-gray-500 mt-1">{currentDate}</p>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Portfolio Value"
          value={formatCurrency(portfolioValue)}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Today's P&L"
          value={formatCurrency(todayPnL, true)}
          change={{
            value: `${todayPnLPercent}%`,
            isPositive: todayPnL > 0,
          }}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatsCard
          title="Open Positions"
          value={positions.length}
          description={positions.length === 0 ? 'No positions yet' : 'Active holdings'}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingOrders.length}
          description={pendingOrders.length === 0 ? 'All caught up' : 'Awaiting your review'}
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/watchlist">
              <Button variant="primary">Create Watchlist</Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline">Adjust Settings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <EmptyState
                icon={<EmptyIcon />}
                title="No trading activity yet"
                description="Start by creating a watchlist to track stocks!"
              />
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{order.symbol}</span>
                        <Badge
                          variant={order.side === 'buy' || order.side === 'cover' ? 'success' : 'danger'}
                        >
                          {toTitleCase(order.side)}
                        </Badge>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {toTitleCase(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.quantity} shares • {formatDateTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/orders">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Orders →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Mode</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getAutonomyLevelLabel(1)} Mode
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Agent proposes trades, you approve each one
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-gray-900">Agent is currently: Monitoring markets</p>
                </div>
                <p className="text-xs text-gray-500">
                  Last check: {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  💡 Tip
                </p>
                <p className="text-sm text-blue-700">
                  Adjust your autonomy level in Settings to give the agent more or less control
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

