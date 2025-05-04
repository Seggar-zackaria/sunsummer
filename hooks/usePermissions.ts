import { useSession } from "next-auth/react";
import { DEFAULT_PERMISSIONS, Permission, UserRole } from '@/lib/types/permissions'

export function usePermissions() {
  const { data: session } = useSession();

  const hasPermission = (permission: Permission): boolean => {
    if (!session?.user) return false;
    
    // Get user role from session
    const userRole = session.user.role as UserRole;
    
    if (!userRole) return false;

    // Check permissions based on role
    return DEFAULT_PERMISSIONS[userRole].includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return session?.user?.role === role;
  };

  return { hasPermission, hasRole };
}
