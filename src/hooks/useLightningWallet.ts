
import { useState, useEffect } from 'react';
import { BitcoinWalletService, WalletKeys } from '../services/bitcoinWallet';
import { WebLNService, WebLNBalance, WebLNTransaction, WebLNInvoice, WebLNPayment } from '../services/weblnService';
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
    balance: null,
    transactions: [],
    isLoading: false,
    error: null,
    isConnecting: false,
    lastSyncTime: null,
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
          
          setConnecting(true);
          // Connect to WebLN
          await WebLNService.connect();
          setConnecting(false);
          
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
      setConnecting(false);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);

      const walletKeys = await BitcoinWalletService.generateWallet();
      
      setConnecting(true);
      // Connect to WebLN
      await WebLNService.connect();
      setConnecting(false);
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await refreshWalletData();
      return walletKeys.mnemonic.split(' ');
    } catch (error) {
      handleError(error);
      setConnecting(false);
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
      
      setConnecting(true);
      // Connect to WebLN
      await WebLNService.connect();
      setConnecting(false);
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await refreshWalletData();
    } catch (error) {
      handleError(error);
      setConnecting(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    try {
      if (!WebLNService.isConnected()) {
        return;
      }

      // Sync with the network first
      await WebLNService.sync();

      const [balance, transactions] = await Promise.all([
        WebLNService.getBalance(),
        WebLNService.getTransactions(),
      ]);

      setState(prev => ({
        ...prev,
        balance,
        transactions,
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

      const invoice = await WebLNService.createInvoice(amount, description);
      await refreshWalletData();
      return invoice;
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

      const payment = await WebLNService.payInvoice(bolt11);
      await refreshWalletData();
      return payment;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteWallet = async () => {
    try {
      await WebLNService.disconnect();
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

  // Auto-refresh wallet data every 30 seconds
  useEffect(() => {
    if (state.isInitialized && WebLNService.isConnected()) {
      const interval = setInterval(() => {
        refreshWalletData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [state.isInitialized]);

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
