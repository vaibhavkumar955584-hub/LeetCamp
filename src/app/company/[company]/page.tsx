import { notFound } from 'next/navigation';
import { getExactCompanyName, getCompanyProblems, getCompanyOverview } from '@/lib/db';
import { ProblemExplorer } from '@/components/ProblemExplorer';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    company: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedCompany = decodeURIComponent(resolvedParams.company);
  const exactName = getExactCompanyName(decodedCompany);

  if (!exactName) {
    return {
      title: 'Company Not Found | LeetCode Explorer',
    };
  }

  return {
    title: `${exactName} LeetCode Questions | Company-Wise Interview Problems`,
    description: `Practice top LeetCode questions asked in ${exactName} technical interviews. Filter by 30/90 days, difficulty, and topic tags.`,
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawCompany = resolvedParams.company;
  const decodedCompany = decodeURIComponent(rawCompany);
  const exactCompany = getExactCompanyName(decodedCompany);

  if (!exactCompany) {
    notFound();
  }

  // Fetch initial batch of problems for fast first paint
  const initialResult = getCompanyProblems(exactCompany, {
    page: 1,
    limit: 50,
  });

  const overview = getCompanyOverview(exactCompany);

  return (
    <div>
      <ProblemExplorer
        company={exactCompany}
        initialData={{
          problems: initialResult.problems,
          pagination: initialResult.pagination,
          overview,
        }}
      />
    </div>
  );
}
