
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import Layout from '../components/Layout';
import ActionButton from '../components/ActionButton';

const Receive: React.FC = () => {
  const navigate = useNavigate();
  const { receiveFlow, generateInvoice, resetReceiveFlow } = useWallet();
  const [amount, setAmount] = useState('');

  const handleGenerateInvoice = () => {
    if (amount) {
      generateInvoice(parseFloat(amount));
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
          onClick={handleGenerateInvoice}
          variant="success"
          size="lg"
          className="w-full"
          disabled={!amount}
        >
          GENERATE
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

      {/* QR Code Placeholder */}
      <div className="brutal-card">
        <div className="aspect-square bg-black flex items-center justify-center mb-4">
          <div className="bg-white p-8 text-center">
            <p className="font-mono text-sm">QR CODE</p>
            <p className="font-mono text-xs text-gray-500">
              {receiveFlow.invoice?.substring(0, 20)}...
            </p>
          </div>
        </div>
        
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
