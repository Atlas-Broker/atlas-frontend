import { Badge } from '@/components/ui/badge';
import type { EnvironmentType } from '@/lib/supabase';
import { getEnvironmentBadgeColor } from '@/lib/utils';

export interface EnvironmentBadgeProps {
  environment: EnvironmentType;
  showWarning?: boolean;
}

export function EnvironmentBadge({ environment, showWarning = false }: EnvironmentBadgeProps) {
  const isLive = environment === 'live';
  
  return (
    <div className="flex items-center gap-2">
      <Badge
        className={getEnvironmentBadgeColor(environment)}
      >
        {environment.toUpperCase()}
      </Badge>
      {isLive && showWarning && (
        <span className="text-xs text-red-600 font-medium">
          ⚠️ Real money
        </span>
      )}
    </div>
  );
}

