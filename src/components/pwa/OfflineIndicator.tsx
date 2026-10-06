import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (justReconnected) {
    return (
      <div 
        role="status" 
        aria-live="polite"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#2E473B] text-[#F7F3E9] px-3.5 py-1.5 text-xs font-medium shadow-md border border-[#446252] animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-[#A5C4A3]" />
        <span>Back online · Data synchronized</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#524131] text-[#F7F3E9] px-3.5 py-1.5 text-xs font-medium shadow-md border border-[#7D6650] animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#E6C687]" />
      <span>Offline mode · Saving changes locally</span>
    </div>
  );
};
