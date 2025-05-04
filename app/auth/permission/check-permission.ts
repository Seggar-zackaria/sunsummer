import { DEFAULT_PERMISSIONS, Permission } from '@/lib/types/permissions';
import { auth } from '@/auth'; 
import { redirect } from 'next/navigation';

export async function checkPermission(requiredPermission: Permission) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userPermissions = session.user.role || DEFAULT_PERMISSIONS[session.user.role];
  
  if (!userPermissions.includes(requiredPermission)) {
    throw new Error('Forbidden: unautherized');
    
  }

  return true;
}