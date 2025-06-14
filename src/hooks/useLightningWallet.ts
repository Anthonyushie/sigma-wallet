
import { useState, useEffect } from 'react';
import { BitcoinWalletService, WalletKeys } from '../services/bitcoinWallet';
import { WebLNBalance, WebLNTransaction, WebLNInvoice, WebLNPayment } from '../services/weblnService';
import { BreezErrorHandler, BreezError } from '../utils/errorHandling';

export interface LightningWalletState {
  isInitialized: boolean;
  walletKeys: WalletKeys | null;
  balance: WebLNBalance | null;
  transactions: WebLNTransaction[];
  isLoading: boolean;
  error: BreezError | null;
  isConnecting: boolean;
  lastSyncTime: Date | null;
}

export const useLightningWallet = () => {
  const [state, setState] = useState<LightningWalletState>({
    isInitialized: false,
    walletKeys: null,
    balance: { balance: 25000, pendingReceive: 0, pendingSend: 0 },
    transactions: [],
    isLoading: false,
    error: null,
    isConnecting: false,
    lastSyncTime: new Date(),
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setConnecting = (isConnecting: boolean) => {
    setState(prev => ({ ...prev, isConnecting }));
  };

  const setError = (error: BreezError | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const handleError = (error: unknown): BreezError => {
    const breezError = BreezErrorHandler.handleError(error);
    setError(breezError);
    return breezError;
  };

  const initializeWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasWallet = await BitcoinWalletService.hasWallet();
      if (hasWallet) {
        const mnemonic = await BitcoinWalletService.getStoredMnemonic();
        if (mnemonic) {
          const walletKeys = await BitcoinWalletService.restoreWallet(mnemonic);
          
          setState(prev => ({
            ...prev,
            isInitialized: true,
            walletKeys,
          }));
          
          await refreshWalletData();
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);

      const walletKeys = await BitcoinWalletService.generateWallet();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await refreshWalletData();
      return walletKeys.mnemonic.split(' ');
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const restoreWallet = async (mnemonic: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const walletKeys = await BitcoinWalletService.restoreWallet(mnemonic);
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await refreshWalletData();
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    try {
      // Use mock data instead of WebLN
      const mockBalance: WebLNBalance = {
        balance: 25000,
        pendingReceive: 0,
        pendingSend: 0,
      };

      const mockTransactions: WebLNTransaction[] = [
        {
          id: '1',
          type: 'receive',
          amount: 10000,
          description: 'Lightning payment received',
          status: 'complete',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          type: 'send',
          amount: 5000,
          description: 'Lightning payment sent',
          status: 'complete',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        }
      ];

      setState(prev => ({
        ...prev,
        balance: mockBalance,
        transactions: mockTransactions,
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      handleError(error);
    }
  };

  const createInvoice = async (amount: number, description?: string): Promise<WebLNInvoice> => {
    try {
      setLoading(true);
      setError(null);

      // Mock invoice generation
      const mockInvoice: WebLNInvoice = {
        id: `invoice_${Date.now()}`,
        bolt11: `lnbc${amount}u1pwrp5z5pp5rw8awzpnz2drg9fhz2t3c5w4u8q7hnpm9pjq8wg7rwm6lczjl2qqsqjpgx`,
        amount,
        description: description || 'Lightning payment',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };

      await refreshWalletData();
      return mockInvoice;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const payInvoice = async (bolt11: string): Promise<WebLNPayment> => {
    try {
      setLoading(true);
      setError(null);

      // Mock payment
      const mockPayment: WebLNPayment = {
        id: `payment_${Date.now()}`,
        bolt11,
        amount: 0,
        description: 'Lightning payment',
        status: 'complete',
        createdAt: new Date().toISOString(),
      };

      await refreshWalletData();
      return mockPayment;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteWallet = async () => {
    try {
      await BitcoinWalletService.deleteWallet();
      setState({
        isInitialized: false,
        walletKeys: null,
        balance: null,
        transactions: [],
        isLoading: false,
        error: null,
        isConnecting: false,
        lastSyncTime: null,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const retryLastOperation = async () => {
    if (state.error && BreezErrorHandler.isRetryable(state.error.type)) {
      await refreshWalletData();
    }
  };

  useEffect(() => {
    initializeWallet();
  }, []);

  return {
    ...state,
    createWallet,
    restoreWallet,
    refreshWalletData,
    createInvoice,
    payInvoice,
    deleteWallet,
    retryLastOperation,
    // Helper methods
    isRetryable: state.error ? BreezErrorHandler.isRetryable(state.error.type) : false,
    errorMessage: state.error?.userMessage || null,
  };
};
