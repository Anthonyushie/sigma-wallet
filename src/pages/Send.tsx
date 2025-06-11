
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import Layout from '../components/Layout';
import ActionButton from '../components/ActionButton';

const Send: React.FC = () => {
  const navigate = useNavigate();
  const { sendFlow, initiateSend, confirmSend, resetSendFlow } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleNext = () => {
    if (recipient && amount) {
      initiateSend(recipient, parseFloat(amount));
    }
  };

  const handleConfirm = () => {
    confirmSend();
  };

  const handleBack = () => {
    if (sendFlow.step === 'input') {
      navigate('/dashboard');
    } else {
      resetSendFlow();
    }
  };

  const renderInputScreen = () => (
    <div className="space-y-6">
      <div className="brutal-card">
        <h2 className="text-2xl font-black mb-6">SEND PAYMENT</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-sm mb-2">
              RECIPIENT
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Lightning invoice or Bitcoin address"
              className="brutal-input w-full"
            />
          </div>
          
          <div>
            <label className="block font-black uppercase text-sm mb-2">
              AMOUNT
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00000000"
              className="brutal-input w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          onClick={handleBack}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          CANCEL
        </ActionButton>
        
        <ActionButton
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!recipient || !amount}
        >
          CONTINUE
        </ActionButton>
      </div>
    </div>
  );

  const renderConfirmScreen = () => (
    <div className="space-y-6">
      <div className="brutal-card bg-electric-orange text-black">
        <h2 className="text-2xl font-black mb-4">⚠️ CONFIRM PAYMENT</h2>
        <p className="font-mono">
          Review the details carefully. This action cannot be undone!
        </p>
      </div>

      <div className="brutal-card">
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-sm mb-1">
              SENDING TO
            </label>
            <p className="font-mono text-sm break-all bg-gray-100 p-2 border-2 border-black">
              {sendFlow.recipient}
            </p>
          </div>
          
          <div>
            <label className="block font-black uppercase text-sm mb-1">
              AMOUNT
            </label>
            <p className="font-mono text-3xl font-black">
              {sendFlow.amount} BTC
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          onClick={handleBack}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          BACK
        </ActionButton>
        
        <ActionButton
          onClick={handleConfirm}
          variant="danger"
          size="lg"
          className="w-full"
        >
          SEND NOW
        </ActionButton>
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="space-y-6 relative overflow-hidden">
      {/* GIGACHAD Animation Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-electric-purple to-electric-lime opacity-20 animate-pulse"></div>
        <div className="gigachad-animation">
          <img 
            src="/lovable-uploads/ea45c64a-f7d3-4f99-b2b9-c7425cf7f77b.png" 
            alt="GIGACHAD" 
            className="gigachad-image"
          />
        </div>
      </div>

      {/* Success Content */}
      <div className="relative z-10">
        <div className="brutal-card bg-electric-lime text-black text-center border-4 border-black shadow-brutal-lg">
          <h2 className="text-4xl font-black mb-4 animate-bounce">✅ GIGACHAD PAYMENT SENT!</h2>
          <p className="font-mono text-xl font-black">
            ABSOLUTE UNIT OF A TRANSACTION
          </p>
          <p className="font-mono text-lg mt-2">
            CHAD LEVEL: MAXIMUM
          </p>
        </div>

        <div className="brutal-card bg-electric-blue text-black border-4 border-black shadow-brutal">
          <div className="space-y-2">
            <p className="font-black uppercase text-sm">GIGACHAD AMOUNT SENT</p>
            <p className="font-mono text-3xl font-black animate-pulse">
              {sendFlow.amount} BTC
            </p>
            <p className="font-mono text-sm">
              💪 TRANSACTION STATUS: ALPHA 💪
            </p>
          </div>
        </div>

        <ActionButton
          onClick={() => {
            resetSendFlow();
            navigate('/dashboard');
          }}
          variant="primary"
          size="lg"
          className="w-full font-black text-xl animate-pulse"
        >
          BACK TO CHAD DASHBOARD
        </ActionButton>
      </div>

      <style>{`
        .gigachad-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          pointer-events: none;
        }
        
        .gigachad-image {
          width: 300px;
          height: auto;
          opacity: 0.15;
          animation: gigachad-spin 3s linear infinite, gigachad-pulse 2s ease-in-out infinite alternate;
          filter: brightness(1.5) contrast(1.2);
        }
        
        @keyframes gigachad-spin {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.2); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes gigachad-pulse {
          0% { 
            opacity: 0.1; 
            filter: brightness(1) contrast(1) hue-rotate(0deg);
          }
          100% { 
            opacity: 0.3; 
            filter: brightness(2) contrast(1.5) hue-rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  return (
    <Layout showBack>
      <div className="max-w-md mx-auto py-8">
        {sendFlow.step === 'input' && renderInputScreen()}
        {sendFlow.step === 'confirm' && renderConfirmScreen()}
        {sendFlow.step === 'success' && renderSuccessScreen()}
      </div>
    </Layout>
  );
};

export default Send;
