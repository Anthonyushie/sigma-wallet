
import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useToast } from '@/components/ui/use-toast';
import ActionButton from './ActionButton';

interface InstallPromptProps {
  onClose: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onClose }) => {
  const { installApp } = usePWA();
  const { toast } = useToast();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App Installed!",
        description: "Sigma Wallet has been added to your home screen.",
      });
      onClose();
    } else {
      toast({
        title: "Installation Failed",
        description: "Unable to install the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="brutal-card max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Download size={32} className="text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-black mb-2">INSTALL SIGMA WALLET</h3>
            <p className="text-sm text-gray-600 font-mono">
              Add to your home screen for the ultimate SIGMA experience!
            </p>
          </div>
          
          <div className="space-y-3">
            <ActionButton
              onClick={handleInstall}
              variant="primary"
              size="lg"
              className="w-full"
            >
              INSTALL APP
            </ActionButton>
            
            <button
              onClick={onClose}
              className="w-full py-2 text-sm font-mono text-gray-500 hover:text-gray-700 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
