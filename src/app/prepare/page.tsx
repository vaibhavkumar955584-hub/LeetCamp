import { Metadata } from 'next';
import { PreparationDashboard } from '@/components/PreparationDashboard';

export const metadata: Metadata = {
  title: 'Personalized Interview Preparation Plan | LeetCamp v3',
  description: 'Create and track your personalized company-specific interview preparation roadmap with daily missions and pattern balancing.',
};

export default function PreparePage() {
  return (
    <div className="py-4">
      <PreparationDashboard />
    </div>
  );
}
