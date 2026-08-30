import { Metadata } from 'next';
import { CompanyComparison } from '@/components/CompanyComparison';

export const metadata: Metadata = {
  title: 'Compare Companies & Shared Questions | LeetCamp v3',
  description: 'Compare interview questions across top companies and discover high-yield shared problems.',
};

export default function ComparePage() {
  return (
    <div className="py-4">
      <CompanyComparison />
    </div>
  );
}
