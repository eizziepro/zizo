import React from 'react';
import { PageHeader } from '../components/untitledui/PageHeader';
import { Badge } from '../components/untitledui/Badge';

export const CasesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases Management"
        description="Cross-border case lifecycle coordination, matching milestones, and timeline tracking."
        breadcrumbs={[{ label: 'Staff Portal', href: '/' }, { label: 'Cases' }]}
      />

      <div className="rounded-[10px] border border-[#E1E0DD] bg-white p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
        <Badge variant="brand" size="lg">Phase 2 Feature</Badge>
        <h2 className="text-xl font-semibold text-[#17191A]">Cases Pipeline in Development</h2>
        <p className="text-sm text-[#5D5E5F] leading-relaxed">
          The unified case tracking engine (anonymized ZZ-0000 identifiers, coordinator assignments, gestational milestones, and legal milestones) is scheduled for Phase 2 deployment following client portal onboarding.
        </p>
      </div>
    </div>
  );
};
