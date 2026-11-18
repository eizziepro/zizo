import { useAuth } from '../context/AuthContext';
import type { StaffRole } from '../types';

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  owner: [
    'overview',
    'inquiries',
    'applications',
    'cases',
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
    'settings:notifications',
    'settings:team',
  ],
  coordinator: [
    'overview',
    'inquiries',
    'applications',
    'cases',
    'bookings',
    'consultation-types',
    'subscribers',
    'settings:profile',
    'settings:security',
    'settings:availability',
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
