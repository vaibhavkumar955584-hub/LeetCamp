import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { QuestionLookup } from '@/components/QuestionLookup';

export const metadata: Metadata = {
  title: 'Question Reverse-Lookup | LeetCamp',
  description: 'Search any LeetCode DSA problem to find which companies ask it in interviews, recency timeframes, and frequencies.',
};

export const dynamic = 'force-dynamic';

function QuestionLookupFallback() {
  return (
    <div className="w-full max-w-7xl mx-auto py-12 text-center text-sm text-[var(--text-muted)] animate-pulse">
      Loading Question Finder...
    </div>
  );
}

export default function LookupPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<QuestionLookupFallback />}>
        <QuestionLookup />
      </Suspense>
    </div>
  );
}
