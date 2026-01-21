import { getUserProfile } from '@/lib/permissions';
import { getUserOrders } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState, EmptyIcon } from '@/components/shared/EmptyState';
import { formatCurrency, formatDateTime, getOrderStatusColor, toTitleCase } from '@/lib/utils';
import type { OrderStatus } from '@/lib/supabase';

export default async function OrdersPage() {
  const profile = await getUserProfile();
  
  if (!profile) {
    return null;
  }

  const allOrders = await getUserOrders(profile.id);

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
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
              <TableCell className="text-sm text-gray-500">
                {formatDateTime(order.created_at)}
              </TableCell>
              <TableCell>
                {order.confidence_score
                  ? `${(order.confidence_score * 100).toFixed(0)}%`
                  : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">View and manage your trading orders</p>
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

