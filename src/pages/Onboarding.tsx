
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import Layout from '../components/Layout';
import ActionButton from '../components/ActionButton';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { onboarding, generateWallet, restoreWallet, confirmBackup } = useWallet();
  const [restoreInput, setRestoreInput] = useState('');
  const [backupConfirmed, setBackupConfirmed] = useState(false);

  const handleGenerateWallet = () => {
    generateWallet();
  };

  const handleRestoreWallet = () => {
    if (restoreInput.trim()) {
      const seedPhrase = restoreInput.trim().split(' ');
      restoreWallet(seedPhrase);
      navigate('/dashboard');
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
          SIGMA WALLET
        </h1>
        <p className="text-lg font-mono">
          Self-custodial Bitcoin & Lightning
        </p>
      </div>
      
      <div className="brutal-card text-center">
        <h2 className="text-2xl font-black mb-4">CREATE NEW WALLET</h2>
        <p className="mb-6 font-mono">
          Generate a new wallet with a 12-word seed phrase
        </p>
        <ActionButton 
          onClick={handleGenerateWallet}
          variant="primary"
          size="lg"
          className="w-full"
        >
          GENERATE WALLET
        </ActionButton>
      </div>

      <div className="brutal-card text-center">
        <h2 className="text-2xl font-black mb-4">RESTORE WALLET</h2>
        <p className="mb-4 font-mono">
          Already have a wallet? Enter your seed phrase
        </p>
        <textarea
          value={restoreInput}
          onChange={(e) => setRestoreInput(e.target.value)}
          placeholder="Enter your 12-word seed phrase..."
          className="brutal-input w-full h-24 resize-none mb-4"
        />
        <ActionButton 
          onClick={handleRestoreWallet}
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={!restoreInput.trim()}
        >
          RESTORE WALLET
        </ActionButton>
      </div>
    </div>
  );

  const renderBackupReminder = () => (
    <div className="space-y-6">
      <div className="brutal-card bg-electric-orange text-black">
        <h2 className="text-2xl font-black mb-4">⚠️ BACKUP YOUR WALLET</h2>
        <p className="font-mono mb-4">
          Write down these 12 words in order. This is your ONLY way to recover your wallet!
        </p>
      </div>

      <div className="brutal-card">
        <h3 className="text-lg font-black mb-4">YOUR SEED PHRASE</h3>
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
              I have written down my seed phrase in a safe place
            </span>
          </label>
          
          <ActionButton 
            onClick={handleConfirmBackup}
            variant="success"
            size="lg"
            className="w-full"
            disabled={!backupConfirmed}
          >
            CONFIRM BACKUP
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
