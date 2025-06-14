import { useState, useEffect, useCallback } from 'react';
import { BitcoinWalletService, WalletKeys } from '../services/bitcoinWallet';
import { WebLNBalance, WebLNTransaction, WebLNInvoice, WebLNPayment } from '../services/weblnService';
import { BreezErrorHandler, BreezError } from '../utils/errorHandling';
import { breezService, BreezWalletState } from '../services/breezService';

export interface LightningWalletState {
  isInitialized: boolean;
  walletKeys: WalletKeys | null;
  balance: WebLNBalance | null;
  transactions: WebLNTransaction[];
  isLoading: boolean;
  error: BreezError | null;
  isConnecting: boolean;
  lastSyncTime: Date | null;
  isOnline: boolean;
}

export const useLightningWallet = () => {
  const [state, setState] = useState<LightningWalletState>({
    isInitialized: false,
    walletKeys: null,
    balance: { balance: 0, pendingReceive: 0, pendingSend: 0 },
    transactions: [],
    isLoading: false,
    error: null,
    isConnecting: false,
    lastSyncTime: null,
    isOnline: navigator.onLine,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setConnecting = useCallback((isConnecting: boolean) => {
    setState(prev => ({ ...prev, isConnecting }));
  }, []);

  const setError = useCallback((error: BreezError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const handleError = useCallback((error: unknown): BreezError => {
    const breezError = BreezErrorHandler.handleError(error);
    setError(breezError);
    return breezError;
  }, [setError]);

  const updateBalanceFromBreez = useCallback(async () => {
    try {
      if (!breezService.isReady()) return;

      const walletState: BreezWalletState = await breezService.getWalletInfo();
      
      setState(prev => ({
        ...prev,
        balance: {
          balance: walletState.balance,
          pendingReceive: walletState.pendingReceive,
          pendingSend: walletState.pendingSend,
        },
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const initializeWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const hasWallet = await BitcoinWalletService.hasWallet();
      if (hasWallet) {
        const mnemonic = await BitcoinWalletService.getStoredMnemonic();
        if (mnemonic) {
          const walletKeys = await BitcoinWalletService.restoreWallet(mnemonic);
          
          // Initialize Breez SDK
          setConnecting(true);
          await breezService.initialize(mnemonic);
          setConnecting(false);

          setState(prev => ({
            ...prev,
            isInitialized: true,
            walletKeys,
          }));

          await updateBalanceFromBreez();
        }
      }
    } catch (error) {
      setConnecting(false);
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading, setConnecting, updateBalanceFromBreez]);

  const createWallet = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);

      const walletKeys = await BitcoinWalletService.generateWallet();

      // Initialize Breez SDK with new mnemonic
      setConnecting(true);
      await breezService.initialize(walletKeys.mnemonic);
      setConnecting(false);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await updateBalanceFromBreez();
      return walletKeys.mnemonic.split(' ');
    } catch (error) {
      setConnecting(false);
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading, setConnecting, updateBalanceFromBreez]);

  const restoreWallet = useCallback(async (mnemonic: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const walletKeys = await BitcoinWalletService.restoreWallet(mnemonic);

      // Initialize Breez SDK
      setConnecting(true);
      await breezService.initialize(mnemonic);
      setConnecting(false);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await updateBalanceFromBreez();
    } catch (error) {
      setConnecting(false);
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading, setConnecting, updateBalanceFromBreez]);

  const refreshWalletData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (breezService.isReady()) {
        await breezService.sync();
        await updateBalanceFromBreez();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading, updateBalanceFromBreez]);

  const createInvoice = useCallback(async (amount: number, description?: string): Promise<WebLNInvoice> => {
    try {
      setLoading(true);
      setError(null);

      if (!breezService.isReady()) {
        throw new Error('Lightning wallet not ready');
      }

      const response = await breezService.createInvoice(amount, description);
      
      const invoice: WebLNInvoice = {
        id: response.paymentHash,
        bolt11: response.bolt11,
        amount,
        description: description || 'Lightning payment',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };

      await updateBalanceFromBreez();
      return invoice;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading, updateBalanceFromBreez]);

  const payInvoice = useCallback(async (bolt11: string): Promise<WebLNPayment> => {
    try {
      setLoading(true);
      setError(null);

      if (!breezService.isReady()) {
        throw new Error('Lightning wallet not ready');
      }

      const response = await breezService.payInvoice(bolt11);
      
      const payment: WebLNPayment = {
        id: response.paymentHash,
        bolt11,
        amount: 0, // Amount will be extracted from bolt11
        description: 'Lightning payment',
        status: response.status === 'complete' ? 'complete' : 'pending',
        createdAt: new Date().toISOString(),
      };

      await updateBalanceFromBreez();
      return payment;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading, updateBalanceFromBreez]);

  const deleteWallet = useCallback(async () => {
    try {
      await breezService.disconnect();
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
        isOnline: navigator.onLine,
      });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const retryLastOperation = useCallback(async () => {
    if (state.error && BreezErrorHandler.isRetryable(state.error.type)) {
      await refreshWalletData();
    }
  }, [state.error, refreshWalletData]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (breezService.isReady()) {
        refreshWalletData();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshWalletData]);

  // Initialize wallet on mount
  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);

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
