import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { LightningProtocolHandler } from '../utils/protocolHandler';
import Layout from '../components/Layout';
import ActionButton from '../components/ActionButton';

const Send: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendFlow, initiateSend, confirmSend, resetSendFlow, isLightningLoading, lightningError } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [detectedAmount, setDetectedAmount] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle pre-filled invoice from protocol handler
  useEffect(() => {
    if (location.state?.invoice) {
      setRecipient(location.state.invoice);
      validateRecipient(location.state.invoice);
    }
  }, [location.state]);

  const validateRecipient = (value: string) => {
    setValidationError(null);
    setDetectedAmount(null);

    if (!value.trim()) return;

    // Check for Lightning invoice
    if (LightningProtocolHandler.isLightningInvoice(value)) {
      const extractedAmount = LightningProtocolHandler.extractAmountFromInvoice(value);
      if (extractedAmount) {
        setDetectedAmount(extractedAmount);
        setAmount(extractedAmount.toString());
      }
      setValidationError(null);
      return;
    }

    // Check for Lightning URI
    const parsed = LightningProtocolHandler.handleLightningUri(value);
    if (parsed && parsed.type === 'invoice') {
      if (parsed.amount) {
        setDetectedAmount(parsed.amount);
        setAmount(parsed.amount.toString());
      }
      setValidationError(null);
      return;
    }

    // Invalid format
    setValidationError('Invalid Lightning invoice format');
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipient(value);
    validateRecipient(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear detected amount if user manually changes amount
    if (detectedAmount && parseInt(value) !== detectedAmount) {
      setDetectedAmount(null);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardData = await LightningProtocolHandler.handleClipboard();
      if (clipboardData && clipboardData.type === 'invoice') {
        setRecipient(clipboardData.value);
        if (clipboardData.amount) {
          setDetectedAmount(clipboardData.amount);
          setAmount(clipboardData.amount.toString());
        }
        validateRecipient(clipboardData.value);
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const handleNext = () => {
    if (recipient && amount && !validationError) {
      initiateSend(recipient, parseFloat(amount));
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmSend();
    } catch (error) {
      console.error('Payment failed:', error);
    }
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
        <h2 className="text-2xl font-black mb-6">SLIDE SOME COIN</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-sm mb-2">
              LIGHTNING INVOICE
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={recipient}
                onChange={handleRecipientChange}
                placeholder="lnbc... (paste Lightning invoice here)"
                className={`brutal-input w-full ${validationError ? 'border-red-500' : ''}`}
                disabled={isLightningLoading}
              />
              <ActionButton
                onClick={handlePasteFromClipboard}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                📋 PASTE FROM CLIPBOARD
              </ActionButton>
            </div>
            {validationError && (
              <p className="text-red-500 text-sm mt-1 font-mono">{validationError}</p>
            )}
            {LightningProtocolHandler.isLightningInvoice(recipient) && !validationError && (
              <p className="text-green-500 text-sm mt-1 font-mono">✅ Valid Lightning invoice</p>
            )}
          </div>
          
          <div>
            <label className="block font-black uppercase text-sm mb-2">
              AMOUNT (SATS)
              {detectedAmount && (
                <span className="text-electric-lime ml-2">
                  (Auto-detected: {detectedAmount} sats)
                </span>
              )}
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount in satoshis"
              className="brutal-input w-full"
              disabled={isLightningLoading || !!detectedAmount}
            />
            {detectedAmount && (
              <p className="text-electric-lime text-sm mt-1 font-mono">
                Amount extracted from invoice
              </p>
            )}
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
          NAH, GO BACK
        </ActionButton>
        
        <ActionButton
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!recipient || !amount || !!validationError || isLightningLoading}
        >
          {isLightningLoading ? "PROCESSING..." : "NEXT UP"}
        </ActionButton>
      </div>
    </div>
  );

  const renderConfirmScreen = () => (
    <div className="space-y-6">
      <div className="brutal-card bg-electric-orange text-black">
        <h2 className="text-2xl font-black mb-4">⚡️ DOUBLE CHECK, FAM</h2>
        <p className="font-mono">
          Peep the deets. Once it's sent, it's BUSSIN' – no cap!
        </p>
      </div>

      <div className="brutal-card">
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-sm mb-1">
              LIGHTNING INVOICE
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
              {sendFlow.amount} SATS
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
          disabled={isLightningLoading}
        >
          BACK
        </ActionButton>
        
        <ActionButton
          onClick={handleConfirm}
          variant="danger"
          size="lg"
          className="w-full"
          disabled={isLightningLoading}
        >
          {isLightningLoading ? "SENDING..." : "YEET IT"}
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
          <div className="gigachad-image-placeholder">
            🗿
          </div>
        </div>
      </div>

      {/* Success Content */}
      <div className="relative z-10">
        <div className="brutal-card bg-electric-lime text-black text-center border-4 border-black shadow-brutal-lg">
          <h2 className="text-4xl font-black mb-4 animate-bounce">✅ COIN SENT, YOU'RE H1M</h2>
          <p className="font-mono text-xl font-black">
            ABSOLUTE DUB 🏆
          </p>
          <p className="font-mono text-lg mt-2">
            YOUR BAG JUST SHRANK A LITTLE 😅
          </p>
        </div>

        <div className="brutal-card bg-electric-blue text-black border-4 border-black shadow-brutal">
          <div className="space-y-2">
            <p className="font-black uppercase text-sm">AMOUNT DROPPED</p>
            <p className="font-mono text-3xl font-black animate-pulse">
              {sendFlow.amount} SATS
            </p>
            <p className="font-mono text-sm">
              ✅ ALL SET, GANG
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
          BACK TO STACK
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
        
        .gigachad-image-placeholder {
          width: 300px;
          height: 300px;
          opacity: 0.15;
          animation: gigachad-spin 3s linear infinite, gigachad-pulse 2s ease-in-out infinite alternate;
          filter: brightness(1.5) contrast(1.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10rem;
          background: linear-gradient(45deg, #00BFFF, #32FF32);
          border-radius: 20px;
          border: 8px solid #000;
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
