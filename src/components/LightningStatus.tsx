
import React from 'react';
import { Zap, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const LightningStatus: React.FC = () => {
  const { 
    isLightningInitialized, 
    isLightningConnecting, 
    isLightningLoading,
    lastSyncTime,
    refreshLightningData 
  } = useWallet();

  const getStatusColor = () => {
    if (isLightningConnecting) return 'bg-electric-orange';
    if (isLightningInitialized) return 'bg-electric-lime';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isLightningConnecting) return 'CONNECTING...';
    if (isLightningInitialized) return 'LIGHTNING READY';
    return 'DISCONNECTED';
  };

  const getStatusIcon = () => {
    if (isLightningConnecting) return <RefreshCw size={16} className="animate-spin" />;
    if (isLightningInitialized) return <Zap size={16} />;
    return <WifiOff size={16} />;
  };

  return (
    <div className="brutal-card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-1 ${getStatusColor()} border-2 border-black`}>
            {getStatusIcon()}
          </div>
          <div>
            <p className="font-black text-xs uppercase">{getStatusText()}</p>
            {lastSyncTime && (
              <p className="text-xs text-gray-500 font-mono">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        {isLightningInitialized && (
          <button
            onClick={refreshLightningData}
            disabled={isLightningLoading}
            className="brutal-button p-2 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLightningLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LightningStatus;
