import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from './Icons';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-nav py-3">
      <div className="container">
        <ol className="flex items-center flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
          <li>
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                <li aria-hidden="true" className="opacity-40 select-none">
                  <ChevronRightIcon size={14} />
                </li>
                <li>
                  {isLast || !item.href ? (
                    <span aria-current="page" className="font-medium text-[var(--text-primary)]">
                      {item.name}
                    </span>
                  ) : (
                    <Link href={item.href} className="hover:text-[var(--text-primary)] transition-colors">
                      {item.name}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
