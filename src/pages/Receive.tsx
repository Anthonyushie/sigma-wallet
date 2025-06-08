
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
        <h2 className="text-2xl font-black mb-6">REQUEST PAYMENT</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-sm mb-2">
              AMOUNT (SATS)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="21000"
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
          CANCEL
        </ActionButton>
        
        <ActionButton
          onClick={handleGenerateInvoice}
          variant="success"
          size="lg"
          className="w-full"
          disabled={!amount || isLightningLoading}
        >
          {isLightningLoading ? 'GENERATING...' : 'GENERATE'}
        </ActionButton>
      </div>
    </div>
  );

  const renderInvoiceScreen = () => (
    <div className="space-y-6">
      <div className="brutal-card">
        <h2 className="text-2xl font-black mb-4">LIGHTNING INVOICE</h2>
        <p className="font-mono text-lg">
          Amount: {receiveFlow.amount} SATS
        </p>
      </div>

      {/* QR Code */}
      {receiveFlow.invoice && (
        <QRCodeDisplay 
          value={receiveFlow.invoice} 
          size={250}
          className="mb-4"
        />
      )}
        
      <div className="brutal-card">
        <ActionButton
          onClick={handleCopyInvoice}
          variant="primary"
          size="md"
          className="w-full flex items-center justify-center space-x-2"
        >
          <Copy size={16} />
          <span>COPY INVOICE</span>
        </ActionButton>
      </div>

      {/* Invoice Details */}
      <div className="brutal-card">
        <h3 className="font-black uppercase text-sm mb-2">INVOICE</h3>
        <div className="bg-gray-100 p-3 border-2 border-black font-mono text-xs break-all">
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
        className="w-full"
      >
        BACK TO DASHBOARD
      </ActionButton>
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
