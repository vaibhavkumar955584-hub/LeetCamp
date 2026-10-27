import { Metadata } from 'next';
import { CustomDPSection } from '@/components/custom/CustomDPSection';

export const metadata: Metadata = {
  title: 'My Custom DP Problems | LeetCamp',
  description: 'Personalized Dynamic Programming problem list with custom questions',
};

export default function CustomDPPage() {
  return (
    <div className="py-4">
      <CustomDPSection />
    </div>
  );
}
