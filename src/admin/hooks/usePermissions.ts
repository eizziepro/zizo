import { useAuth } from '../context/AuthContext';
import type { StaffRole } from '../types';

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  owner: [
    'overview',
    'inquiries',
    'applications',
    'bookings',
    'consultation-types',
    'services',
    'blog',
    'faqs',
    'reviews',
    'subscribers',
    'audit-log',
    'settings:profile',
    'settings:security',
    'settings:site',
    'settings:availability',
    'settings:integrations',
    'settings:notifications',
    'settings:team',
  ],
  coordinator: [
    'overview',
    'inquiries',
    'applications',
    'bookings',
    'consultation-types',
    'subscribers',
    'settings:profile',
    'settings:security',
    'settings:availability',
    'settings:integrations',
    'settings:notifications',
  ],
  editor: [
    'overview',
    'services',
    'blog',
    'faqs',
    'reviews',
    'settings:profile',
    'settings:security',
    'settings:notifications',
  ],
};

export function usePermissions() {
  const { role, user } = useAuth();

  const canAccess = (permissionKey: string): boolean => {
    if (!role) return false;
    if (role === 'owner') return true;

    // Check individual custom permissions assigned to this staff member
    if (user?.permissions && Array.isArray(user.permissions)) {
      if (['overview', 'settings:profile', 'settings:security', 'settings:notifications'].includes(permissionKey)) {
        return true;
      }
      return user.permissions.includes(permissionKey);
    }

    const allowed = ROLE_PERMISSIONS[role] || [];
    return allowed.includes(permissionKey);
  };

  const isOwner = role === 'owner';
  const isCoordinator = role === 'coordinator';
  const isEditor = role === 'editor';

  return {
    role,
    user,
    canAccess,
    isOwner,
    isCoordinator,
    isEditor,
  };
}
