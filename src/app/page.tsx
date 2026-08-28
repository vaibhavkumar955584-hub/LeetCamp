import { getAllCompanies } from '@/lib/db';
import { CompanyDirectory } from '@/components/CompanyDirectory';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const companies = getAllCompanies();

  return (
    <div>
      <CompanyDirectory initialCompanies={companies} />
    </div>
  );
}
