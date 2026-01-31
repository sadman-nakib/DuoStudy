
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Hourglass, Timer as TimerIcon, ChevronRight } from 'lucide-react';
import { TimerMode } from '../types';

interface TimerProps {
  userId: string;
  onTimeUpdate: (seconds: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ userId, onTimeUpdate }) => {
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [initialCountdown, setInitialCountdown] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (mode === 'countdown') {
            if (prev <= 1) {
              // Timer finished: Trigger long vibration pattern
              if ('vibrate' in navigator) {
                navigator.vibrate([500, 150, 500, 150, 500]);
              }
              setIsActive(false);
              return initialCountdown;
            }
            onTimeUpdate(1);
            return prev - 1;
          }
          onTimeUpdate(1);
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, initialCountdown, onTimeUpdate]);

  const haptic = (strength: number = 20) => {
    if ('vibrate' in navigator) navigator.vibrate(strength);
  };

  const handleStartStop = () => {
    haptic();
    setIsActive(!isActive);
  };

  const handleReset = () => {
    haptic(40);
    setIsActive(false);
    if (mode === 'countdown') {
      setSeconds(initialCountdown);
    } else {
      setSeconds(0);
    }
  };

  const setupCountdown = (mins: number) => {
    haptic();
    const s = Math.max(1, Math.min(1440, mins)) * 60; // Limit between 1 min and 24 hours
    setInitialCountdown(s);
    setSeconds(s);
    setIsActive(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      setupCountdown(mins);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full space-y-8 items-center pb-32">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Focus</h1>
        <div className="flex bg-[#E7E0EC] dark:bg-[#49454F] rounded-full p-1 shadow-inner">
          <button
            onClick={() => { setMode('stopwatch'); setSeconds(0); setIsActive(false); }}
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${mode === 'stopwatch' ? 'bg-[#6750A4] text-white shadow-sm' : 'text-[#49454F] dark:text-[#CAC4D0]'}`}
          >
            <TimerIcon size={16} /> Stopwatch
          </button>
          <button
            onClick={() => { setMode('countdown'); setupCountdown(25); }}
            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${mode === 'countdown' ? 'bg-[#6750A4] text-white shadow-sm' : 'text-[#49454F] dark:text-[#CAC4D0]'}`}
          >
            <Hourglass size={16} /> Pomodoro
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-12 py-10 w-full flex-grow">
        <div className="relative">
          <div className="absolute inset-0 bg-[#D3E3FD] dark:bg-[#004A77] rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="text-[100px] font-mono font-bold tracking-tighter text-[#1D1B20] dark:text-[#E6E1E5] tabular-nums leading-none z-10 relative">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={handleReset}
            className="p-5 bg-[#E7E0EC] dark:bg-[#49454F] rounded-full text-[#49454F] dark:text-[#CAC4D0] active:scale-90 transition-transform"
          >
            <RotateCcw size={32} />
          </button>
          
          <button
            onClick={handleStartStop}
            className={`p-8 rounded-full text-white shadow-xl active:scale-95 transition-all transform ${isActive ? 'bg-[#BA1A1A] dark:bg-[#FFB4AB] !text-black' : 'bg-[#6750A4]'}`}
          >
            {isActive ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
          </button>
          
          <div className="w-20"></div> {/* Spacer for symmetry */}
        </div>
      </div>

      {mode === 'countdown' && (
        <div className="w-full space-y-4">
          <div className="space-y-4">
            <p className="text-center text-sm font-medium text-[#49454F] dark:text-[#938F99]">Quick Presets</p>
            <div className="grid grid-cols-3 gap-3">
              {[10, 25, 45].map((m) => (
                <button
                  key={m}
                  onClick={() => setupCountdown(m)}
                  className={`py-3 rounded-2xl border-2 transition-all ${initialCountdown === m * 60 ? 'border-[#6750A4] bg-[#F3E8FF] dark:bg-[#2B2930] text-[#6750A4] dark:text-[#D0BCFF]' : 'border-[#CAC4D0] dark:border-[#49454F] text-[#49454F] dark:text-[#CAC4D0]'}`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCustomSubmit} className="relative flex items-center gap-2">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Custom mins..."
              className="flex-1 bg-white dark:bg-[#2B2930] rounded-2xl px-5 py-3 border-2 border-transparent focus:border-[#6750A4] outline-none text-sm transition-all"
              min="1"
              max="1440"
            />
            <button
              type="submit"
              className="p-3 bg-[#6750A4] text-white rounded-2xl shadow-md active:scale-95 transition-transform"
            >
              <ChevronRight size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
