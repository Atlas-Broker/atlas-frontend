import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/lib/supabase';
import { getRoleBadgeColor, toTitleCase } from '@/lib/utils';

export interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge className={getRoleBadgeColor(role)}>
      {toTitleCase(role)}
    </Badge>
  );
}

