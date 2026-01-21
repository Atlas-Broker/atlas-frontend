import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Position } from '@/lib/supabase';
import { formatCurrency, formatPercentage, getPnLColor, calculatePercentageChange } from '@/lib/utils';

export interface PositionCardProps {
  position: Position;
  onClose?: (position: Position) => void;
}

export function PositionCard({ position, onClose }: PositionCardProps) {
  const pnlPercentage = position.current_price
    ? calculatePercentageChange(position.avg_entry_price, position.current_price)
    : 0;

  const totalValue = position.current_price
    ? position.current_price * position.quantity
    : position.avg_entry_price * position.quantity;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{position.symbol}</h3>
            <p className="text-sm text-gray-500">{position.quantity} shares</p>
          </div>
          {position.unrealized_pnl !== null && (
            <div className="text-right">
              <p className={`text-lg font-bold ${getPnLColor(position.unrealized_pnl)}`}>
                {formatCurrency(position.unrealized_pnl, true)}
              </p>
              <p className={`text-sm font-medium ${getPnLColor(position.unrealized_pnl)}`}>
                {formatPercentage(pnlPercentage, true)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm border-t pt-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Avg Entry:</span>
            <span className="font-medium">{formatCurrency(position.avg_entry_price)}</span>
          </div>
          {position.current_price && (
            <div className="flex justify-between">
              <span className="text-gray-500">Current:</span>
              <span className="font-medium">{formatCurrency(position.current_price)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Total Value:</span>
            <span className="font-medium">{formatCurrency(totalValue)}</span>
          </div>
        </div>

        {onClose && (
          <Button
            onClick={() => onClose(position)}
            variant="outline"
            size="sm"
            className="mt-4 w-full"
          >
            Close Position
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

