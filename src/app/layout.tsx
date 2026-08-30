import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { BootSequence } from '@/components/BootSequence';
import { getDatasetMetadata } from '@/lib/db';

export const metadata: Metadata = {
  title: 'LeetCamp — Company-wise LeetCode & DSA Patterns Explorer',
  description: 'Explore real-world technical interview questions across 429+ companies and 48 curated DSA algorithmic patterns.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metadata = getDatasetMetadata();
  const formattedDate = metadata.lastIngestedAt 
    ? new Date(metadata.lastIngestedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <html lang="en" className="dark" data-theme="green">
      <body className="min-h-screen flex flex-col antialiased relative">
        {/* Terminal Boot Sequence (Once Per Session) */}
        <BootSequence />

        {/* Global Navigation Bar */}
        <Navbar />
        
        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          {children}
        </main>

        {/* Modern Footer */}
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] py-8 text-center text-xs text-[var(--text-muted)] relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] inline-block" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                LeetCamp · Technical Interview & 48 DSA Patterns v2.0
              </p>
            </div>
            <p className="max-w-2xl mx-auto text-xs text-[var(--text-secondary)] leading-relaxed">
              Direct links route to LeetCode and official source repositories. Proprietary statements are not stored locally.
            </p>
            {formattedDate && (
              <p className="text-[11px] text-[var(--text-muted)] mono pt-1">
                Database Snapshot: {formattedDate} · {metadata.totalCompanies} Companies · {metadata.totalCompanyQuestions?.toLocaleString()} Company Questions ({metadata.totalUniqueLeetCodeProblems?.toLocaleString()} Unique Problems) · 48 DSA Patterns ({metadata.totalPatternProblems?.toLocaleString()} Problems)
              </p>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
