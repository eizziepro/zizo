'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { CloseIcon, PhoneIcon, MessageSquareIcon, ChevronRightIcon } from './Icons';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation"
      className="mobile-nav-overlay fixed inset-0 z-50 bg-[var(--black-base)]/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="mobile-nav-panel fixed inset-y-0 right-0 w-full max-w-sm bg-[var(--surface-page)] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
            <span className="font-semibold text-lg text-[var(--black-shade-150)]">
              {siteConfig.name}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 rounded-md hover:bg-[var(--surface-soft)] text-[var(--black-tint-100)]"
            >
              <CloseIcon size={24} />
            </button>
          </div>

          {/* Links */}
          <nav className="py-6 flex flex-col gap-2">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between py-3 px-3 rounded-md text-base font-medium text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors min-h-[44px]"
              >
                <span>{link.label}</span>
                <ChevronRightIcon size={16} className="text-[var(--text-muted)]" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer CTAs */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-3">
          <Link
            href="/book-a-call/"
            onClick={onClose}
            className="btn btn-primary w-full justify-center text-center"
          >
            Book a Call
          </Link>
          <a
            href={siteConfig.whatsapp.general.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp w-full justify-center text-center"
          >
            <MessageSquareIcon size={18} />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href={`tel:${siteConfig.contact.phoneGeneralRaw}`}
            className="flex items-center justify-center gap-2 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <PhoneIcon size={16} />
            <span>{siteConfig.contact.phoneGeneral}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
