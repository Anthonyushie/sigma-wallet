
import React from 'react';
import { WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff size={16} />
        <span className="text-sm font-mono font-bold">OFFLINE MODE - SIGMA STILL STRONG</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
