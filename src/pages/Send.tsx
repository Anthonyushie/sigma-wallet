
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { isValidLightningInvoice } from '../services/breez/utils';
import { decodeInvoice } from '../utils/invoiceDecoder';
import Layout from '../components/Layout';
import ActionButton from '../components/ActionButton';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { useToast } from '@/hooks/use-toast';

const Send: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendFlow, initiateSend, confirmSend, resetSendFlow, isLightningLoading, lightningError, lightningBalance } = useWallet();
  const [invoice, setInvoice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInvoiceSubmit = () => {
    if (invoice.trim()) {
      if (!isValidLightningInvoice(invoice.trim())) {
        toast({
          title: "Invalid Invoice",
          description: "Please enter a valid Lightning invoice.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Decode the invoice to get the actual amount
        const invoiceDetails = decodeInvoice(invoice.trim());
        const amount = invoiceDetails.amount;
        
        if (amount <= 0) {
          toast({
            title: "Invalid Amount",
            description: "Invoice amount must be greater than 0 sats.",
            variant: "destructive",
          });
          return;
        }
        
        initiateSend(invoice.trim(), amount);
      } catch (error) {
        console.error('Failed to decode invoice:', error);
        toast({
          title: "Invalid Invoice",
          description: "Could not decode the Lightning invoice. Please check the format.",
          variant: "destructive",
        });
      }
    }
  };

  const handleConfirmSend = async () => {
    try {
      setIsProcessing(true);
      await confirmSend();
      // Only navigate to success if payment actually succeeded
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      // Error handling is done by the Lightning wallet hook via toast
      // Don't navigate to success state
    } finally {
      setIsProcessing(false);
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
        <h2 className="text-xl sm:text-2xl font-black mb-6">SEND SATS 🚀</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-black uppercase text-sm mb-2">
              INVOICE
            </label>
            <textarea
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Paste Lightning Invoice Here"
              className="brutal-input w-full min-h-[120px] resize-none text-sm"
              disabled={isLightningLoading}
            />
          </div>
          
          {lightningError && (
            <div className="brutal-card bg-red-500 text-white">
              <p className="font-mono text-xs sm:text-sm break-words">{lightningError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <ActionButton
          onClick={handleBack}
          variant="secondary"
          size="lg"
          className="w-full order-2 sm:order-1"
          disabled={isLightningLoading}
        >
          NEVERMIND
        </ActionButton>
        
        <ActionButton
          onClick={handleInvoiceSubmit}
          variant="success"
          size="lg"
          className="w-full order-1 sm:order-2"
          disabled={!invoice || isLightningLoading}
        >
          {isLightningLoading ? "COOKING..." : "INITIATE SEND"}
        </ActionButton>
      </div>
    </div>
  );

  const renderConfirmScreen = () => (
    <div className="space-y-6">
      <div className="brutal-card">
        <h2 className="text-xl sm:text-2xl font-black mb-6">CONFIRM SEND 🚀</h2>
        
        <div className="space-y-4">
          <div>
            <p className="font-mono text-sm text-gray-600 mb-2">Recipient:</p>
            <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded border">
              {sendFlow.recipient}
            </p>
          </div>
          <div>
            <p className="font-mono text-lg">
              Amount: <span className="font-black">{sendFlow.amount} SATS</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-sm text-gray-600">
              Your balance: {lightningBalance} sats
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <ActionButton
          onClick={handleBack}
          variant="secondary"
          size="lg"
          className="w-full order-2 sm:order-1"
          disabled={isLightningLoading}
        >
          NEVERMIND
        </ActionButton>
        
        <ActionButton
          onClick={handleConfirmSend}
          variant="success"
          size="lg"
          className="w-full order-1 sm:order-2"
          disabled={isProcessing || isLightningLoading}
        >
          {isProcessing ? "SENDING..." : "CONFIRM SEND"}
        </ActionButton>
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="space-y-6">
      <div className="brutal-card">
        <h2 className="text-xl sm:text-2xl font-black mb-6 text-center">PAYMENT SENT! 🎉</h2>
        
        <div className="space-y-4">
          <div>
            <p className="font-mono text-lg text-center">
              Sent <span className="font-black">{sendFlow.amount} SATS</span> to:
            </p>
          </div>
          <div>
            <p className="font-mono text-xs break-all bg-gray-100 p-3 rounded border">
              {sendFlow.recipient}
            </p>
          </div>
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
        BACK TO STACK
      </ActionButton>
    </div>
  );

  return (
    <Layout showBack>
      <div className="max-w-md mx-auto py-4 px-4 sm:py-8">
        {sendFlow.step === 'input' && renderInputScreen()}
        {sendFlow.step === 'confirm' && renderConfirmScreen()}
        {sendFlow.step === 'success' && renderSuccessScreen()}
      </div>
    </Layout>
  );
};

export default Send;
