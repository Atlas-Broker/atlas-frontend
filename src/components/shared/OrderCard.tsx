import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/supabase/models';
import { formatCurrency, formatDateTime, getOrderStatusColor, toTitleCase } from '@/lib/shared/utils';

export interface OrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">{order.symbol}</span>
              <Badge
                variant={order.side === 'buy' || order.side === 'cover' ? 'profit' : 'loss'}
              >
                {toTitleCase(order.side)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {order.quantity} shares • {toTitleCase(order.order_type)}
            </p>
          </div>
          <Badge className={getOrderStatusColor(order.status)}>
            {toTitleCase(order.status)}
          </Badge>
        </div>

        <div className="space-y-1 text-sm">
          {order.limit_price && (
            <div className="flex justify-between">
              <span className="text-gray-500">Limit Price:</span>
              <span className="font-medium">{formatCurrency(order.limit_price)}</span>
            </div>
          )}
          {order.stop_price && (
            <div className="flex justify-between">
              <span className="text-gray-500">Stop Price:</span>
              <span className="font-medium">{formatCurrency(order.stop_price)}</span>
            </div>
          )}
          {order.filled_price && (
            <div className="flex justify-between">
              <span className="text-gray-500">Filled Price:</span>
              <span className="font-medium">{formatCurrency(order.filled_price)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Created:</span>
            <span className="font-medium">{formatDateTime(order.created_at)}</span>
          </div>
          {order.confidence_score !== null && (
            <div className="flex justify-between">
              <span className="text-gray-500">Confidence:</span>
              <span className="font-medium">{(order.confidence_score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {onViewDetails && order.agent_reasoning && (
          <button
            onClick={() => onViewDetails(order)}
            className="mt-3 w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View AI Reasoning →
          </button>
        )}
      </CardContent>
    </Card>
  );
}

