import { Metadata } from 'next';
import { Suspense } from 'react';
import { PracticeCenter } from '@/components/PracticeCenter';

export const metadata: Metadata = {
  title: 'Smart Practice & Mock Interview Simulator | LeetCamp v3',
  description: 'Practice company-specific interview questions based on time, weak areas, and 45-minute timed mock interview simulator.',
};

export default function PracticePage() {
  return (
    <div className="py-4">
      <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading Practice Center...</div>}>
        <PracticeCenter />
      </Suspense>
    </div>
  );
}
