import { Metadata } from 'next';
import { getAllPatterns } from '@/lib/db';
import { PatternDirectory } from '@/components/PatternDirectory';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DSA Patterns & Topic Roadmaps | LEETCAMP',
  description: 'Master Data Structures & Algorithms by pattern. Explore 48 categorized topic roadmaps with 2,960+ curated questions.',
};

export default async function PatternsPage() {
  const patterns = getAllPatterns();

  return (
    <div>
      <PatternDirectory initialPatterns={patterns} />
    </div>
  );
}
