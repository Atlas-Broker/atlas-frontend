import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  description?: string;
}

export function StatsCard({ title, value, change, icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    change.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change.isPositive ? '↑' : '↓'} {change.value}
                </span>
              </div>
            )}
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
          {icon && (
            <div className="ml-4 flex-shrink-0 text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

