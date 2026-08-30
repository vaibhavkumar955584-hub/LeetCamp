import { Metadata } from 'next';
import { ProgressDashboard } from '@/components/ProgressDashboard';

export const metadata: Metadata = {
  title: 'My Preparation Progress & Weak Areas | LeetCamp v3',
  description: 'View your personal interview preparation progress, difficulty win rates, streak, and weakest DSA patterns.',
};

export default function ProgressPage() {
  return (
    <div className="py-4">
      <ProgressDashboard />
    </div>
  );
}
