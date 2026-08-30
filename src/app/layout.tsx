import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { BootSequence } from '@/components/BootSequence';
import { getDatasetMetadata } from '@/lib/db';

export const metadata: Metadata = {
  title: 'LEETCAMP // TERMINAL.SYS — Technical Interview & DSA Patterns Archive',
  description: 'CRT Green-Phosphor Terminal Archive of LeetCode technical interview questions across 470+ companies and 48 curated DSA topic patterns.',
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
    <html lang="en" className="dark bg-[#0b0f0a]">
      <body className="bg-[#0b0f0a] text-[#33ff66] min-h-screen flex flex-col antialiased font-mono selection:bg-[#33ff66] selection:text-[#0b0f0a] relative">
        {/* Terminal Boot Sequence (Once Per Session) */}
        <BootSequence />

        {/* CRT Scanline Overlay */}
        <div className="fixed inset-0 crt-scanlines z-30 opacity-40 pointer-events-none" />

        {/* Full-width Terminal Navbar */}
        <Navbar />
        
        {/* Full-width Main Content Viewport */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          {children}
        </main>

        {/* Full-width Terminal Arcade Footer */}
        <footer className="border-t border-[#1a2e1a] bg-[#0b0f0a] py-6 text-center text-xs text-[#4d7a52] relative z-10 font-mono">
          <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 space-y-2">
            <p className="text-[#33ff66]">
              ★ LEETCAMP.SYS // INTERVIEW ARCHIVE & 48 DSA PATTERNS v2.0 ★
            </p>
            <p className="text-[#4d7a52] max-w-3xl mx-auto text-[11px]">
              <strong className="text-[#33ff66]">NOTICE:</strong> DIRECT LINKS POINT DIRECTLY TO LEETCODE.COM & PROBLEM SOURCES. PROPRIETARY STATEMENTS ARE NOT HOSTED.
            </p>
            {formattedDate && (
              <p className="text-[10px] text-[#4d7a52] pt-1">
                SQLITE_SNAPSHOT: {formattedDate} // {metadata.totalCompanyProblems?.toLocaleString()} COMPANY PROBLEMS // {metadata.totalCompanies} ORGANIZATIONS // {metadata.totalPatterns} DSA PATTERNS ({metadata.totalPatternProblems?.toLocaleString()} QUESTIONS) [ONLINE]
              </p>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
