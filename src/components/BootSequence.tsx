'use client';

import React, { useState, useEffect } from 'react';

const BOOT_LOGS = [
  '> ROM BIOS v3.2 (C) 1984 CRT TERMINAL SYSTEMS',
  '> INITIALIZING LEETCAMP.SYS [WAL_MODE: ON]...',
  '> LOADING SQLITE DATA STRUCTURES [data/problems.db]...',
  '> 429 ORGANIZATIONS LOADED // 37,714 INTERVIEW RECORDS INDEXED.',
  '> HIGH-SCORE LEADERBOARD READY.',
  '> SYSTEM STATUS: OPERATIONAL. LAUNCHING DIRECTORY...',
];

export function BootSequence({ onComplete }: { onComplete?: () => void }) {
  const [booting, setBooting] = useState<boolean | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasBooted = sessionStorage.getItem('crt_boot_completed') === 'true';

    if (isReducedMotion || hasBooted) {
      setBooting(false);
      if (onComplete) onComplete();
      return;
    }

    setBooting(true);
  }, [onComplete]);

  const finishBoot = () => {
    sessionStorage.setItem('crt_boot_completed', 'true');
    setBooting(false);
    if (onComplete) onComplete();
  };

  useEffect(() => {
    if (booting !== true) return;

    if (currentLineIdx < BOOT_LOGS.length) {
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, BOOT_LOGS[currentLineIdx]]);
        setCurrentLineIdx((prev) => prev + 1);
      }, 120);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        finishBoot();
      }, 350);
      return () => clearTimeout(finishTimer);
    }
  }, [booting, currentLineIdx]);

  useEffect(() => {
    if (booting !== true) return;

    const handleKeyDown = () => finishBoot();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [booting]);

  if (booting === null || booting === false) {
    return null;
  }

  return (
    <div
      onClick={finishBoot}
      className="fixed inset-0 z-[100] bg-[#0b0f0a] flex flex-col justify-between p-6 sm:p-12 font-mono text-xs sm:text-sm text-[#33ff66] select-none cursor-pointer"
    >
      <div className="space-y-2 max-w-4xl">
        <div className="font-arcade text-xs text-[#ffb000] pb-2">
          ★ LEETCAMP TERMINAL ARCHIVE ★
        </div>
        {lines.map((line, idx) => (
          <div key={idx} className="leading-relaxed tracking-wider crt-glow">
            {line}
          </div>
        ))}
        {currentLineIdx < BOOT_LOGS.length && (
          <span className="inline-block w-2.5 h-4 bg-[#33ff66] animate-cursor ml-1 align-middle" />
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#4d7a52] pt-6 border-t border-[#1a2e1a]">
        <span>[ ESC / CLICK ANYWHERE TO SKIP BOOT ]</span>
        <span className="font-arcade text-[10px]">SPEED: 9600 BAUD</span>
      </div>
    </div>
  );
}
