
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, Smartphone } from 'lucide-react';
import Layout from '../components/Layout';
import { Switch } from '../components/ui/switch';
import { usePWA } from '../hooks/usePWA';
import InstallPrompt from '../components/InstallPrompt';
import ActionButton from '../components/ActionButton';
import SigmaLogo from '../components/SigmaLogo';

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { isInstallable, isInstalled, isOnline } = usePWA();

  useEffect(() => {
    // Check if dark mode is already enabled
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  return (
    <Layout title="SETTINGS" showBack>
      <div className="max-w-md mx-auto space-y-6">
        
        {/* App Logo */}
        <div className="flex justify-center mb-6">
          <SigmaLogo size={80} />
        </div>

        {/* PWA Installation Section */}
        {(isInstallable || !isInstalled) && (
          <div className="brutal-card">
            <h2 className="text-2xl font-black mb-6">APP INSTALLATION</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6" />
                <div className="flex-1">
                  <p className="font-black uppercase text-sm">INSTALL SIGMA WALLET</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {isInstalled ? 'ALREADY INSTALLED' : 'ADD TO HOME SCREEN FOR MAXIMUM ALPHA'}
                  </p>
                </div>
              </div>
              
              {isInstallable && !isInstalled && (
                <ActionButton
                  onClick={() => setShowInstallPrompt(true)}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  <Download size={16} className="mr-2" />
                  INSTALL APP
                </ActionButton>
              )}
              
              {isInstalled && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-mono font-bold">APP INSTALLED</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Network Status */}
        <div className="brutal-card">
          <h2 className="text-2xl font-black mb-6">NETWORK STATUS</h2>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="font-black uppercase text-sm">
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {isOnline ? 'CONNECTED TO THE MATRIX' : 'SIGMA WORKS OFFLINE TOO'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Dark Mode Section */}
        <div className="brutal-card">
          <h2 className="text-2xl font-black mb-6">APPEARANCE</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon className="w-6 h-6" />
              ) : (
                <Sun className="w-6 h-6" />
              )}
              <div>
                <p className="font-black uppercase text-sm">DARK MODE</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {isDarkMode ? 'SIGMA DARKNESS ACTIVATED' : 'LIGHT MODE ACTIVE'}
                </p>
              </div>
            </div>
            
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-electric-blue"
            />
          </div>
        </div>

        {/* App Info Section */}
        <div className="brutal-card">
          <h2 className="text-2xl font-black mb-4">APP INFO</h2>
          <div className="space-y-2">
            <p className="font-mono text-sm">
              <span className="font-black">VERSION:</span> 1.0.0-SIGMA-PWA
            </p>
            <p className="font-mono text-sm">
              <span className="font-black">BUILD:</span> GIGACHAD-PWA-EDITION
            </p>
            <p className="font-mono text-sm">
              <span className="font-black">STATUS:</span> MAXIMUM ALPHA PWA
            </p>
            <p className="font-mono text-sm">
              <span className="font-black">PWA:</span> {isInstalled ? 'INSTALLED' : 'WEB VERSION'}
            </p>
          </div>
        </div>

      </div>
      
      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
    </Layout>
  );
};

export default Settings;
