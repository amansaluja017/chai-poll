import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function usePollTimer(expiry: string | Date | number | undefined) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiry) return;
    const expiryDate = new Date(expiry);

    const calculateTimeLeft = () => {
      const difference = expiryDate.getTime() - new Date().getTime();
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
      }
      return 'Expired';
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  return timeLeft;
}

interface ClockTimerProps {
  timeLeft: string;
  variant?: 'default' | 'minimal';
}

export default function ClockTimer({ timeLeft, variant = 'default' }: ClockTimerProps) {
  if (variant === 'minimal') {
    return (
      <div className='flex justify-center items-center gap-2'>
        <div className="w-5 h-5 rounded-full bg-[#F2923B]/10 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 text-[#F2923B]" />
        </div>
        <p className="text-md font-bold text-(--sea-ink) tabular-nums">{timeLeft}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-(--surface-strong) px-5 py-3 rounded-2xl border border-(--line) shrink-0">
      <Clock className="w-5 h-5 text-[#F2923B]" />
      <div>
        <p className="text-xs font-medium text-(--sea-ink-soft) uppercase tracking-wider">Time Remaining</p>
        <p className="text-xl font-bold text-(--sea-ink) tabular-nums leading-none">{timeLeft}</p>
      </div>
    </div>
  );
}
