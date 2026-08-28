import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-mono space-y-6 px-4">
      <div className="border border-[#ff3b3b] bg-[#140b0b] p-8 max-w-lg w-full space-y-4 shadow-2xl">
        <div className="font-arcade text-base sm:text-lg text-[#ff3b3b] tracking-wider">
          ★ [ 404: MODULE_NOT_FOUND ] ★
        </div>
        
        <div className="h-px bg-[#ff3b3b]/30 w-full" />

        <p className="text-xs text-[#ff8080] leading-relaxed">
          &gt; ERROR: THE REQUESTED COMPANY MODULE OR ROUTE WAS NOT FOUND IN THE SQLITE INTERVIEW ARCHIVE.
        </p>

        <p className="text-[11px] text-[#62ad6a]">
          PLEASE VERIFY SPELLING OR RETURN TO THE MAIN DIRECTORY LEADERBOARD.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#33ff66] bg-[#162e19] text-[#33ff66] text-xs font-bold hover:bg-[#33ff66] hover:text-[#0b0f0a] transition-all"
          >
            [ ← RETURN_TO_ROOT_DIRECTORY ]
          </Link>
        </div>
      </div>
    </div>
  );
}
