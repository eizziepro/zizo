import React from 'react';
import { Badge, type BadgeVariant } from '../untitledui/Badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');

  let variant: BadgeVariant = 'gray';
  let label = status.replace(/_/g, ' ');

  // Capitalize each word
  label = label.replace(/\b\w/g, (c) => c.toUpperCase());

  switch (normalized) {
    case 'confirmed':
    case 'approved':
    case 'published':
    case 'completed':
    case 'active':
      variant = 'success';
      break;

    case 'new':
    case 'pending':
    case 'scheduled':
      variant = 'warning';
      break;

    case 'in_progress':
    case 'contacted':
    case 'screening':
    case 'in_screening':
      variant = 'brand';
      break;

    case 'cancelled':
    case 'declined':
    case 'rejected':
    case 'spam':
    case 'no_show':
    case 'inactive':
      variant = 'error';
      break;

    case 'draft':
    case 'waitlist':
    case 'on_hold':
    case 'archived':
    case 'closed':
    case 'unsubscribed':
    default:
      variant = 'gray';
      break;
  }

  return (
    <Badge variant={variant} dot className={`capitalize whitespace-nowrap shrink-0 ${className}`}>
      {label}
    </Badge>
  );
};
