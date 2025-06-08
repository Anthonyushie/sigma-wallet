
import { useState, useEffect } from 'react';
import { BitcoinWalletService, WalletKeys } from '../services/bitcoinWallet';
import { BreezSDKService, BreezBalance, BreezTransaction, BreezInvoice, BreezPayment } from '../services/breezSDK';

export interface LightningWalletState {
  isInitialized: boolean;
  walletKeys: WalletKeys | null;
  balance: BreezBalance | null;
  transactions: BreezTransaction[];
  isLoading: boolean;
  error: string | null;
}

export const useLightningWallet = () => {
  const [state, setState] = useState<LightningWalletState>({
    isInitialized: false,
    walletKeys: null,
    balance: null,
    transactions: [],
    isLoading: false,
    error: null,
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
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
          
          // Connect to Breez SDK
          await BreezSDKService.connect(mnemonic);
          
          setState(prev => ({
            ...prev,
            isInitialized: true,
            walletKeys,
          }));
          await refreshWalletData();
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize wallet');
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);

      const walletKeys = await BitcoinWalletService.generateWallet();
      
      // Connect to Breez SDK with new mnemonic
      await BreezSDKService.connect(walletKeys.mnemonic);
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await refreshWalletData();
      return walletKeys.mnemonic.split(' ');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create wallet');
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
      
      // Connect to Breez SDK
      await BreezSDKService.connect(mnemonic);
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        walletKeys,
      }));

      await refreshWalletData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to restore wallet');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    try {
      const [balance, transactions] = await Promise.all([
        BreezSDKService.getBalance(),
        BreezSDKService.getTransactions(),
      ]);

      setState(prev => ({
        ...prev,
        balance,
        transactions,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh wallet data');
    }
  };

  const createInvoice = async (amount: number, description?: string): Promise<BreezInvoice> => {
    try {
      setLoading(true);
      setError(null);

      const invoice = await BreezSDKService.createInvoice(amount, description);
      await refreshWalletData();
      return invoice;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create invoice');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const payInvoice = async (bolt11: string): Promise<BreezPayment> => {
    try {
      setLoading(true);
      setError(null);

      const payment = await BreezSDKService.payInvoice(bolt11);
      await refreshWalletData();
      return payment;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to pay invoice');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteWallet = async () => {
    try {
      await BreezSDKService.disconnect();
      await BitcoinWalletService.deleteWallet();
      setState({
        isInitialized: false,
        walletKeys: null,
        balance: null,
        transactions: [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete wallet');
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
  };
};
