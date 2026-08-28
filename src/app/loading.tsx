export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] font-mono text-center space-y-4">
      <div className="font-arcade text-xs text-[#33ff66] animate-pulse">
        ★ [ ACCESSING SQLITE STORAGE ENGINE... ] ★
      </div>
      <div className="flex items-center gap-2 text-xs text-[#62ad6a]">
        <span>FETCHING ORGANIZATIONS & PROBLEM RECORDS</span>
        <span className="inline-block w-2.5 h-4 bg-[#33ff66] animate-cursor" />
      </div>
    </div>
  );
}
