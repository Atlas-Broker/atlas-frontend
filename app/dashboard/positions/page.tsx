import { getUserProfile } from '@/lib/permissions';
import { getUserPositions } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState, EmptyIcon } from '@/components/shared/EmptyState';
import { formatCurrency, formatPercentage, getPnLColor, calculatePercentageChange } from '@/lib/utils';

export default async function PositionsPage() {
  const profile = await getUserProfile();
  
  if (!profile) {
    return null;
  }

  const positions = await getUserPositions(profile.id, 'paper');

  // Calculate totals
  const totalValue = positions.reduce((sum, p) => {
    const value = p.current_price
      ? p.current_price * p.quantity
      : p.avg_entry_price * p.quantity;
    return sum + value;
  }, 0);

  const totalPnL = positions.reduce((sum, p) => {
    return sum + (p.unrealized_pnl || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
        <p className="text-gray-500 mt-1">Your current holdings and performance</p>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Unrealized P&L</p>
              <p className={`text-3xl font-bold ${getPnLColor(totalPnL)}`}>
                {formatCurrency(totalPnL, true)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Open Positions</p>
              <p className="text-3xl font-bold text-gray-900">{positions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card>
        <CardContent className="p-6">
          {positions.length === 0 ? (
            <EmptyState
              icon={<EmptyIcon />}
              title="No open positions"
              description="Your approved orders will appear here once filled."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Entry</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Unrealized P&L</TableHead>
                  <TableHead>P&L %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => {
                  const pnlPercent = position.current_price
                    ? calculatePercentageChange(position.avg_entry_price, position.current_price)
                    : 0;
                  const totalValue = position.current_price
                    ? position.current_price * position.quantity
                    : position.avg_entry_price * position.quantity;

                  return (
                    <TableRow key={position.id}>
                      <TableCell className="font-semibold">{position.symbol}</TableCell>
                      <TableCell>{position.quantity}</TableCell>
                      <TableCell>{formatCurrency(position.avg_entry_price)}</TableCell>
                      <TableCell>
                        {position.current_price
                          ? formatCurrency(position.current_price)
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(totalValue)}</TableCell>
                      <TableCell className={getPnLColor(position.unrealized_pnl || 0)}>
                        {position.unrealized_pnl
                          ? formatCurrency(position.unrealized_pnl, true)
                          : 'N/A'}
                      </TableCell>
                      <TableCell className={getPnLColor(position.unrealized_pnl || 0)}>
                        {formatPercentage(pnlPercent, true)}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Close
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

