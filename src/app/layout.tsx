import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { BootSequence } from '@/components/BootSequence';
import { getDatasetMetadata } from '@/lib/db';

export const metadata: Metadata = {
  title: 'LEETCAMP // TERMINAL.SYS — Technical Interview & DSA Patterns Archive',
  description: 'CRT Terminal Archive of LeetCode technical interview questions across 429+ companies and 48 curated DSA topic patterns.',
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
      <body className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col antialiased font-mono selection:bg-[var(--foreground)] selection:text-[var(--background)] relative">
        {/* Terminal Boot Sequence (Once Per Session) */}
        <BootSequence />

        {/* Subtle, Static CRT Scanline Overlay (No flicker, eye-safe) */}
        <div className="fixed inset-0 crt-scanlines z-30 opacity-20 pointer-events-none" />

        {/* Full-width Terminal Navbar with Theme Toggle */}
        <Navbar />
        
        {/* Full-width Main Content Viewport */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          {children}
        </main>

        {/* Full-width Terminal Arcade Footer (BUG 1 FIX: Consistent, distinct stats) */}
        <footer className="border-t border-[#233823] bg-[#111611] py-6 text-center text-xs text-[#86a789] relative z-10 font-mono">
          <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 space-y-2">
            <p className="text-[#4ade80]">
              ★ LEETCAMP.SYS // INTERVIEW ARCHIVE & 48 DSA PATTERNS v2.0 ★
            </p>
            <p className="text-[#86a789] max-w-2xl mx-auto text-[11px] leading-relaxed">
              <strong className="text-[#4ade80]">NOTICE:</strong> DIRECT LINKS POINT DIRECTLY TO LEETCODE.COM & PROBLEM SOURCES. PROPRIETARY STATEMENTS ARE NOT HOSTED.
            </p>
            {formattedDate && (
              <p className="text-[10px] text-[#5e7e61] pt-1">
                SQLITE_SNAPSHOT: {formattedDate} // {metadata.totalCompanies} COMPANIES // {metadata.totalCompanyQuestions?.toLocaleString()} COMPANY-TRACK QUESTIONS ({metadata.totalUniqueLeetCodeProblems?.toLocaleString()} UNIQUE LEETCODE PROBLEMS) // {metadata.totalPatterns} DSA PATTERNS ({metadata.totalPatternProblems?.toLocaleString()} QUESTIONS) [ONLINE]
              </p>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
