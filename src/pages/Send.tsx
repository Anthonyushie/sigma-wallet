
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
    <div className="space-y-6">
      <div className="brutal-card bg-electric-lime text-black text-center">
        <h2 className="text-3xl font-black mb-4">✅ PAYMENT SENT!</h2>
        <p className="font-mono text-lg">
          Your transaction has been broadcast
        </p>
      </div>

      <div className="brutal-card">
        <div className="space-y-2">
          <p className="font-black uppercase text-sm">AMOUNT SENT</p>
          <p className="font-mono text-2xl font-black">
            {sendFlow.amount} BTC
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
        className="w-full"
      >
        BACK TO DASHBOARD
      </ActionButton>
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
