import React from 'react';
import { Link } from 'react-router-dom';
import { Lock01 } from '@untitledui/icons';
import { Button } from '../components/untitledui/Button';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="py-16 text-center space-y-4 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-[#FDF2F2] text-[#9B1C1C] flex items-center justify-center mx-auto">
        <Lock01 className="w-6 h-6" />
      </div>
      <h1 className="page-title text-2xl font-semibold text-[#17191A]">Access Restricted (403)</h1>
      <p className="text-sm text-[#5D5E5F]">
        Your staff role does not have authorization to view this section of the portal. Role permissions
        are strictly enforced via Supabase Row Level Security.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="primary">Return to Overview</Button>
        </Link>
      </div>
    </div>
  );
};
