import React from 'react';
import { Wifi, WifiOff, Database } from 'lucide-react';

interface OfflineIndicatorProps {
  isOffline: boolean;
  onToggle: (state: boolean) => void;
}

export default function OfflineIndicator({ isOffline, onToggle }: OfflineIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Visual Indicator Pill */}
      <button
        onClick={() => onToggle(!isOffline)}
        id="btn-toggle-network-state"
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border ${
          isOffline
            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
        }`}
        title={isOffline ? 'Você está simulando o modo Offline' : 'Você está conectado às APIs do easy'}
      >
        {isOffline ? (
          <>
            <WifiOff className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            <span className="font-mono">Modo Offline</span>
          </>
        ) : (
          <>
            <Wifi className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="font-mono">Online</span>
          </>
        )}
      </button>

      {/* Persistence confirmation badge */}
      <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider font-bold">
        <Database className="h-3 w-3" />
        <span>LocalCache Ativo</span>
      </div>
    </div>
  );
}
