
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import Layout from '../components/Layout';
import { Switch } from '../components/ui/switch';

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
              <span className="font-black">VERSION:</span> 1.0.0-SIGMA
            </p>
            <p className="font-mono text-sm">
              <span className="font-black">BUILD:</span> GIGACHAD-EDITION
            </p>
            <p className="font-mono text-sm">
              <span className="font-black">STATUS:</span> MAXIMUM ALPHA
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;
