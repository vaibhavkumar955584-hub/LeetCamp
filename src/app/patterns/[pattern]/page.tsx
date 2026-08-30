import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getExactPatternCategory, getPatternProblems, getPatternOverview } from '@/lib/db';
import { PatternExplorer } from '@/components/PatternExplorer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    pattern: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedPattern = decodeURIComponent(resolvedParams.pattern);
  const patternInfo = getExactPatternCategory(decodedPattern);

  if (!patternInfo) {
    return {
      title: 'Pattern Not Found | LEETCAMP',
    };
  }

  return {
    title: `${patternInfo.category} DSA Pattern Problems | LEETCAMP`,
    description: `Master ${patternInfo.category} DSA questions with company tags, difficulty filters, and accuracy stats.`,
  };
}

export default async function PatternDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawPattern = resolvedParams.pattern;
  const decodedPattern = decodeURIComponent(rawPattern);
  const patternInfo = getExactPatternCategory(decodedPattern);

  if (!patternInfo) {
    notFound();
  }

  const initialResult = getPatternProblems(patternInfo.slug, {
    page: 1,
    limit: 50,
  });

  const overview = getPatternOverview(patternInfo.slug);

  return (
    <div>
      <PatternExplorer
        slug={patternInfo.slug}
        initialData={{
          problems: initialResult.problems,
          pagination: initialResult.pagination,
          overview,
        }}
      />
    </div>
  );
}
