'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/config';
import { MenuIcon, MessageSquareIcon } from './Icons';
import { MobileNavigation } from './MobileNavigation';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <div className="container flex items-center justify-between h-20">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold text-xl tracking-tight text-[var(--black-shade-150)] hover:opacity-90 transition-opacity"
            aria-label={`${siteConfig.name} Home`}
          >
            <span className="w-8 h-8 rounded-full bg-[var(--action-primary)] text-white flex items-center justify-center font-bold text-sm select-none">
              Z
            </span>
            <span>{siteConfig.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {siteConfig.navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-[var(--action-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={siteConfig.whatsapp.general.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-quiet"
              title="Chat with us on WhatsApp"
            >
              <MessageSquareIcon size={16} />
              <span>WhatsApp</span>
            </a>
            <Link href="/book-a-call/" className="btn btn-primary text-sm px-4 py-2">
              Book a Call
            </Link>
          </div>

          {/* Mobile Menu Trigger & Quick Book */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/book-a-call/" className="btn btn-primary text-xs px-3 py-1.5 min-h-[36px]">
              Book Call
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-md hover:bg-[var(--surface-soft)] text-[var(--text-primary)]"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer */}
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
