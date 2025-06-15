import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { BitcoinWalletService } from '../services/bitcoinWallet';
import Layout from '../components/Layout';
import ActionButton from '../components/ActionButton';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { onboarding, generateWallet, restoreWallet, confirmBackup } = useWallet();
  const [restoreInput, setRestoreInput] = useState('');
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [restoreError, setRestoreError] = useState('');

  const handleGenerateWallet = () => {
    generateWallet();
  };

  const handleRestoreWallet = async () => {
    if (!restoreInput.trim()) return;
    
    setRestoreError('');
    
    try {
      // Clean and validate the input
      const cleanedInput = restoreInput.trim().toLowerCase();
      const words = cleanedInput.split(/\s+/); // Split by any whitespace
      
      // Validate word count
      if (words.length !== 12) {
        setRestoreError('Seed phrase must be exactly 12 words');
        return;
      }
      
      // Validate the mnemonic before attempting restore
      const mnemonicString = words.join(' ');
      if (!BitcoinWalletService.validateMnemonic(mnemonicString)) {
        setRestoreError('Invalid seed phrase. Please check your words and try again.');
        return;
      }
      
      // If validation passes, restore the wallet
      await restoreWallet(words);
      navigate('/dashboard');
    } catch (error) {
      console.error('Restore wallet error:', error);
      setRestoreError('Failed to restore wallet. Please check your seed phrase and try again.');
    }
  };

  const handleConfirmBackup = () => {
    if (backupConfirmed) {
      confirmBackup();
      navigate('/dashboard');
    }
  };

  const renderCreateWallet = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black uppercase">
          SIGMA STACK
        </h1>
        <p className="text-lg font-mono">
          Your keys, your coin. Everything else is mid.
        </p>
      </div>
      
      <div className="brutal-card text-center">
        <h2 className="text-2xl font-black mb-4">START FRESH</h2>
        <p className="mb-6 font-mono">
          Generate a new stack with a 12-word master pass (seed)
        </p>
        <ActionButton 
          onClick={handleGenerateWallet}
          variant="primary"
          size="lg"
          className="w-full"
        >
          LET'S GET THIS BREAD
        </ActionButton>
      </div>

      <div className="brutal-card text-center">
        <h2 className="text-2xl font-black mb-4">RESTORE OG STACK</h2>
        <p className="mb-4 font-mono">
          Got your 12 words? Paste 'em below and flex your recovery skills
        </p>
        <textarea
          value={restoreInput}
          onChange={(e) => {
            setRestoreInput(e.target.value);
            setRestoreError(''); // Clear error when user types
          }}
          placeholder="12-word seed phrase... Don't leak it"
          className="brutal-input w-full h-24 resize-none mb-4"
        />
        {restoreError && (
          <div className="text-red-500 text-sm mb-4 font-mono">
            {restoreError}
          </div>
        )}
        <ActionButton 
          onClick={handleRestoreWallet}
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={!restoreInput.trim()}
        >
          BRING IT BACK
        </ActionButton>
      </div>
    </div>
  );

  const renderBackupReminder = () => (
    <div className="space-y-6">
      <div className="brutal-card bg-electric-orange text-black">
        <h2 className="text-2xl font-black mb-4">🚨 DON'T FUMBLE THE BAG</h2>
        <p className="font-mono mb-4">
          These 12 words? Protect with your life. Lose 'em = R.I.P. your stack.
        </p>
      </div>

      <div className="brutal-card">
        <h3 className="text-lg font-black mb-4">YOUR 12 SAUCE WORDS</h3>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {onboarding.seedPhrase?.map((word, index) => (
            <div key={index} className="brutal-input text-center">
              <span className="text-sm text-gray-500">{index + 1}.</span>
              <span className="font-mono ml-2">{word}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={backupConfirmed}
              onChange={(e) => setBackupConfirmed(e.target.checked)}
              className="w-6 h-6 border-4 border-black"
            />
            <span className="font-mono">
              Got 'em written somewhere safe, fr fr
            </span>
          </label>
          
          <ActionButton 
            onClick={handleConfirmBackup}
            variant="success"
            size="lg"
            className="w-full"
            disabled={!backupConfirmed}
          >
            LOCKED IN ✅
          </ActionButton>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        {onboarding.step === 'create' && renderCreateWallet()}
        {onboarding.step === 'backup' && renderBackupReminder()}
      </div>
    </Layout>
  );
};

export default Onboarding;
