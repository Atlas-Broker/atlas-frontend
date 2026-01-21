import { getAllOrders, getAllUsers } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState, EmptyIcon } from '@/components/shared/EmptyState';
import { formatCurrency, formatDateTime, getOrderStatusColor, toTitleCase } from '@/lib/utils';
import type { OrderStatus } from '@/lib/supabase';

export default async function AdminOrdersPage() {
  const allOrders = await getAllOrders();
  const users = await getAllUsers();

  // Create a map for quick user lookup
  const userMap = new Map(users.map(u => [u.id, u]));

  const filterByStatus = (status?: OrderStatus) => {
    if (!status) return allOrders;
    return allOrders.filter(o => o.status === status);
  };

  const OrdersTable = ({ orders }: { orders: typeof allOrders }) => {
    if (orders.length === 0) {
      return (
        <EmptyState
          icon={<EmptyIcon />}
          title="No orders found"
          description="Orders matching this filter will appear here"
        />
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const user = userMap.get(order.user_id);
              return (
                <TableRow key={order.id}>
                  <TableCell className="text-sm">
                    {user ? (
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown'}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    ) : (
                      'Unknown User'
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{order.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'buy' || order.side === 'cover' ? 'success' : 'danger'}>
                      {toTitleCase(order.side)}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{toTitleCase(order.order_type)}</TableCell>
                  <TableCell>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {toTitleCase(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.filled_price
                      ? formatCurrency(order.filled_price)
                      : order.limit_price
                      ? formatCurrency(order.limit_price)
                      : 'Market'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.environment === 'paper' ? 'success' : 'danger'}>
                      {order.environment.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDateTime(order.created_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  const tabs = [
    {
      id: 'all',
      label: `All (${allOrders.length})`,
      content: <OrdersTable orders={allOrders} />,
    },
    {
      id: 'proposed',
      label: `Proposed (${filterByStatus('proposed').length})`,
      content: <OrdersTable orders={filterByStatus('proposed')} />,
    },
    {
      id: 'approved',
      label: `Approved (${filterByStatus('approved').length})`,
      content: <OrdersTable orders={filterByStatus('approved')} />,
    },
    {
      id: 'filled',
      label: `Filled (${filterByStatus('filled').length})`,
      content: <OrdersTable orders={filterByStatus('filled')} />,
    },
    {
      id: 'rejected',
      label: `Rejected (${filterByStatus('rejected').length})`,
      content: <OrdersTable orders={filterByStatus('rejected')} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
        <p className="text-gray-500 mt-1">View all user orders across the platform</p>
      </div>

      {/* Orders Table with Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs tabs={tabs} defaultTab="all" />
        </CardContent>
      </Card>
    </div>
  );
}

