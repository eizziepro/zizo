import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="space-y-3 pb-6 border-b border-[#E1E0DD]">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5D5E5F]">
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              {b.href ? (
                <a href={b.href} className="hover:text-[#17645F] transition-colors">
                  {b.label}
                </a>
              ) : (
                <span className="text-[#17191A] font-medium">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-semibold text-[#17191A] tracking-tight">
            {title}
          </h1>
          {description && <p className="text-sm text-[#5D5E5F] mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
