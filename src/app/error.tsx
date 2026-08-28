'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-mono space-y-6 px-4">
      <div className="border border-[#ff3b3b] bg-[#140b0b] p-8 max-w-lg w-full space-y-4 shadow-2xl">
        <div className="font-arcade text-base sm:text-lg text-[#ff3b3b] tracking-wider">
          ★ [ 500: SYSTEM_KERNEL_PANIC ] ★
        </div>

        <div className="h-px bg-[#ff3b3b]/30 w-full" />

        <p className="text-xs text-[#ff8080] leading-relaxed">
          &gt; AN UNEXPECTED EXCEPTION OCCURRED DURING EXECUTION.
        </p>

        <div className="p-3 bg-[#0b0f0a] border border-[#ff3b3b]/40 text-left text-[11px] text-[#ff8080] font-mono break-all max-h-32 overflow-y-auto">
          {error.message || 'Unknown runtime error'}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2 border border-[#ffb000] bg-[#291e0a] text-[#ffb000] text-xs font-bold hover:bg-[#ffb000] hover:text-[#0b0f0a] transition-all"
          >
            [ REBOOT_PROCESS ]
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 border border-[#33ff66] bg-[#162e19] text-[#33ff66] text-xs font-bold hover:bg-[#33ff66] hover:text-[#0b0f0a] transition-all"
          >
            [ CD_ROOT ]
          </Link>
        </div>
      </div>
    </div>
  );
}
