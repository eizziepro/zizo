import React from 'react';
import { siteConfig } from '@/lib/config';
import { MessageSquareIcon, PhoneIcon } from './Icons';

interface WhatsAppLinkProps {
  audience?: 'intendedParent' | 'surrogate' | 'eggDonation' | 'general';
  variant?: 'primary' | 'quiet' | 'card';
  className?: string;
  showPhoneFallback?: boolean;
}

export function WhatsAppLink({
  audience = 'general',
  variant = 'primary',
  className = '',
  showPhoneFallback = false,
}: WhatsAppLinkProps) {
  const channel = siteConfig.whatsapp[audience] || siteConfig.whatsapp.general;

  if (variant === 'quiet') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <a
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp-quiet"
        >
          <MessageSquareIcon size={16} />
          <span>{channel.label}</span>
        </a>
        {showPhoneFallback && (
          <span className="text-xs text-[var(--text-muted)]">
            or call <a href={`tel:${siteConfig.contact.phoneGeneralRaw}`} className="underline">{siteConfig.contact.phoneGeneral}</a>
          </span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border-subtle)] flex flex-col gap-2 ${className}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
          Direct WhatsApp Channel
        </span>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          Prefer private, immediate messaging?
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp text-sm py-2 px-4 min-h-[40px]"
          >
            <MessageSquareIcon size={16} />
            <span>{channel.label}</span>
          </a>
          {showPhoneFallback && (
            <a
              href={`tel:${siteConfig.contact.phoneGeneralRaw}`}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <PhoneIcon size={14} />
              <span>Call: {siteConfig.contact.phoneGeneral}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <a
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-whatsapp ${className}`}
    >
      <MessageSquareIcon size={18} />
      <span>{channel.label}</span>
    </a>
  );
}
