import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import Layout from '../components/Layout';
import ActionButton from '../components/ActionButton';
import QRCodeDisplay from '../components/QRCodeDisplay';

const Receive: React.FC = () => {
  const navigate = useNavigate();
  const { receiveFlow, generateInvoice, resetReceiveFlow, isLightningLoading, lightningError } = useWallet();
  const [amount, setAmount] = useState('');

  const handleGenerateInvoice = async () => {
    if (amount) {
      try {
        await generateInvoice(parseFloat(amount));
      } catch (error) {
        console.error('Failed to generate invoice:', error);
      }
    }
  };

  const handleCopyInvoice = async () => {
    if (receiveFlow.invoice) {
      await navigator.clipboard.writeText(receiveFlow.invoice);
      // You could add a toast notification here
    }
  };

  const handleBack = () => {
    if (receiveFlow.step === 'amount') {
      navigate('/dashboard');
    } else {
      resetReceiveFlow();
    }
  };

  const renderAmountScreen = () => (
    <div className="space-y-6">
      <div className="brutal-card">
        <h2 className="text-2xl font-black mb-6">GET THAT BAG 💸</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-sm mb-2">
              DROP THE AMOUNT (SATS)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="How many SATS you wanna catch?"
              className="brutal-input w-full text-2xl"
              disabled={isLightningLoading}
            />
          </div>
          
          {lightningError && (
            <div className="brutal-card bg-red-500 text-white">
              <p className="font-mono text-sm">{lightningError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          onClick={handleBack}
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={isLightningLoading}
        >
          NEVERMIND
        </ActionButton>
        
        <ActionButton
          onClick={handleGenerateInvoice}
          variant="success"
          size="lg"
          className="w-full"
          disabled={!amount || isLightningLoading}
        >
          {isLightningLoading ? "COOKING..." : "PULL UP INVOICE"}
        </ActionButton>
      </div>
    </div>
  );

  const renderInvoiceScreen = () => (
    <div className="space-y-6 relative overflow-hidden">
      {/* BOSS ANIMATION Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-purple via-electric-orange to-electric-blue opacity-25 animate-pulse"></div>
        <div className="boss-animation">
          <div className="boss-image-placeholder">
            💪
          </div>
        </div>
        {/* Additional floating elements */}
        <div className="money-rain">
          <span className="money-emoji">💰</span>
          <span className="money-emoji">💵</span>
          <span className="money-emoji">💸</span>
          <span className="money-emoji">🤑</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="brutal-card bg-electric-orange text-black border-4 border-black shadow-brutal-lg">
          <h2 className="text-3xl font-black mb-4 animate-bounce">⚡ YOU’RE HIM FOR REAL ⚡</h2>
          <p className="font-mono text-xl font-black">
            GET PAID, LEGEND 😎
          </p>
          <p className="font-mono text-lg mt-2">
            Amount: {receiveFlow.amount} SATS 🚀
          </p>
        </div>

        {/* QR Code with epic styling */}
        {receiveFlow.invoice && (
          <div className="brutal-card bg-electric-lime text-black border-4 border-black shadow-brutal relative">
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-electric-purple opacity-10 animate-pulse rounded"></div>
            <div className="relative z-10 flex justify-center">
              <QRCodeDisplay 
                value={receiveFlow.invoice} 
                size={250}
                className="mb-4 animate-pulse border-4 border-black"
              />
            </div>
          </div>
        )}
          
        <div className="brutal-card bg-electric-blue text-black border-4 border-black shadow-brutal">
          <ActionButton
            onClick={handleCopyInvoice}
            variant="primary"
            size="md"
            className="w-full flex items-center justify-center space-x-2 font-black text-lg animate-pulse"
          >
            <Copy size={20} />
            <span>📋 COPY THAT SAUCE</span>
          </ActionButton>
        </div>

        {/* Invoice Details */}
        <div className="brutal-card bg-electric-purple text-white border-4 border-black shadow-brutal">
          <h3 className="font-black uppercase text-sm mb-2">YOUR SAUCE (COPY &amp; PASTE)</h3>
          <div className="bg-black p-3 border-2 border-electric-lime font-mono text-xs break-all text-electric-lime">
            {receiveFlow.invoice}
          </div>
        </div>

        <ActionButton
          onClick={() => {
            resetReceiveFlow();
            navigate('/dashboard');
          }}
          variant="secondary"
          size="lg"
          className="w-full font-black text-xl"
        >
          BACK TO STACK
        </ActionButton>
      </div>

      <style>{`
        .boss-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          pointer-events: none;
        }
        
        .boss-image-placeholder {
          width: 280px;
          height: 280px;
          opacity: 0.12;
          animation: boss-float 4s ease-in-out infinite, boss-glow 3s ease-in-out infinite alternate;
          filter: brightness(1.8) contrast(1.3) sepia(0.3) hue-rotate(30deg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8rem;
          background: linear-gradient(45deg, #00BFFF, #8A2BE2);
          border-radius: 50%;
          border: 8px solid #000;
        }
        
        .money-rain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }
        
        .money-emoji {
          position: absolute;
          font-size: 2rem;
          animation: money-fall 5s linear infinite;
          opacity: 0.4;
        }
        
        .money-emoji:nth-child(1) {
          left: 10%;
          animation-delay: 0s;
        }
        
        .money-emoji:nth-child(2) {
          left: 30%;
          animation-delay: 1.5s;
        }
        
        .money-emoji:nth-child(3) {
          left: 60%;
          animation-delay: 3s;
        }
        
        .money-emoji:nth-child(4) {
          left: 85%;
          animation-delay: 4s;
        }
        
        @keyframes boss-float {
          0%, 100% { 
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          25% { 
            transform: translate(-50%, -55%) rotate(2deg) scale(1.1);
          }
          50% { 
            transform: translate(-50%, -45%) rotate(-1deg) scale(1.05);
          }
          75% { 
            transform: translate(-50%, -50%) rotate(1deg) scale(1.08);
          }
        }
        
        @keyframes boss-glow {
          0% { 
            opacity: 0.08; 
            filter: brightness(1.5) contrast(1) hue-rotate(0deg);
          }
          100% { 
            opacity: 0.18; 
            filter: brightness(2.5) contrast(1.8) hue-rotate(45deg);
          }
        }
        
        @keyframes money-fall {
          0% { 
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% { 
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );

  return (
    <Layout showBack>
      <div className="max-w-md mx-auto py-8">
        {receiveFlow.step === 'amount' && renderAmountScreen()}
        {receiveFlow.step === 'invoice' && renderInvoiceScreen()}
      </div>
    </Layout>
  );
};

export default Receive;
