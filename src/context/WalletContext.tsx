import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { WalletState, Transaction, OnboardingStep, SendFlowState, ReceiveFlowState } from '../types/wallet';
import { useLightningWallet } from '../hooks/useLightningWallet';

interface WalletContextType {
  wallet: WalletState;
  onboarding: OnboardingStep;
  sendFlow: SendFlowState;
  receiveFlow: ReceiveFlowState;
  
  // Lightning wallet state
  isLightningInitialized: boolean;
  lightningBalance: number;
  lightningError: string | null;
  isLightningLoading: boolean;
  isLightningConnecting: boolean;
  lastSyncTime: Date | null;
  
  // Wallet actions
  completeOnboarding: () => void;
  generateWallet: () => Promise<void>;
  restoreWallet: (seedPhrase: string[]) => Promise<void>;
  confirmBackup: () => void;
  
  // Send actions
  initiateSend: (recipient: string, amount: number) => void;
  confirmSend: () => Promise<void>;
  resetSendFlow: () => void;
  
  // Receive actions
  generateInvoice: (amount: number) => Promise<void>;
  resetReceiveFlow: () => void;
  
  // Lightning actions
  refreshLightningData: () => Promise<void>;
  retryLastOperation: () => Promise<void>;
}

const initialWalletState: WalletState = {
  isOnboarded: false,
  hasBackup: false,
  balance: {
    bitcoin: 0.00234567,
    lightning: 0,
    fiat: 0,
    currency: 'USD'
  },
  transactions: []
};

const initialOnboardingState: OnboardingStep = {
  step: 'create'
};

const initialSendFlowState: SendFlowState = {
  step: 'input'
};

const initialReceiveFlowState: ReceiveFlowState = {
  step: 'amount'
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

type Action = 
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'GENERATE_WALLET'; payload: string[] }
  | { type: 'RESTORE_WALLET'; payload: string[] }
  | { type: 'CONFIRM_BACKUP' }
  | { type: 'SET_ONBOARDING_STEP'; payload: OnboardingStep['step'] }
  | { type: 'INITIATE_SEND'; payload: { recipient: string; amount: number } }
  | { type: 'CONFIRM_SEND' }
  | { type: 'RESET_SEND_FLOW' }
  | { type: 'SET_SEND_STEP'; payload: SendFlowState['step'] }
  | { type: 'GENERATE_INVOICE'; payload: number; invoice: string }
  | { type: 'RESET_RECEIVE_FLOW' }
  | { type: 'SET_RECEIVE_STEP'; payload: ReceiveFlowState['step'] }
  | { type: 'UPDATE_BALANCE'; payload: { lightning: number; fiat: number } }
  | { type: 'UPDATE_TRANSACTIONS'; payload: Transaction[] };

interface State {
  wallet: WalletState;
  onboarding: OnboardingStep;
  sendFlow: SendFlowState;
  receiveFlow: ReceiveFlowState;
}

const walletReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        wallet: { ...state.wallet, isOnboarded: true },
        onboarding: { ...state.onboarding, step: 'complete' }
      };
    
    case 'GENERATE_WALLET':
      return {
        ...state,
        onboarding: { 
          ...state.onboarding, 
          step: 'backup',
          seedPhrase: action.payload 
        }
      };
    
    case 'RESTORE_WALLET':
      return {
        ...state,
        wallet: { ...state.wallet, isOnboarded: true },
        onboarding: { 
          ...state.onboarding, 
          step: 'complete',
          seedPhrase: action.payload 
        }
      };
    
    case 'CONFIRM_BACKUP':
      return {
        ...state,
        wallet: { ...state.wallet, hasBackup: true, isOnboarded: true },
        onboarding: { ...state.onboarding, step: 'complete', isVerified: true }
      };
    
    case 'SET_ONBOARDING_STEP':
      return {
        ...state,
        onboarding: { ...state.onboarding, step: action.payload }
      };
    
    case 'INITIATE_SEND':
      return {
        ...state,
        sendFlow: {
          step: 'confirm',
          recipient: action.payload.recipient,
          amount: action.payload.amount
        }
      };
    
    case 'CONFIRM_SEND':
      return {
        ...state,
        sendFlow: { ...state.sendFlow, step: 'success' }
      };
    
    case 'RESET_SEND_FLOW':
      return {
        ...state,
        sendFlow: initialSendFlowState
      };
    
    case 'SET_SEND_STEP':
      return {
        ...state,
        sendFlow: { ...state.sendFlow, step: action.payload }
      };
    
    case 'GENERATE_INVOICE':
      return {
        ...state,
        receiveFlow: {
          step: 'invoice',
          amount: action.payload,
          invoice: action.invoice,
          qrCode: action.invoice
        }
      };
    
    case 'RESET_RECEIVE_FLOW':
      return {
        ...state,
        receiveFlow: initialReceiveFlowState
      };
    
    case 'SET_RECEIVE_STEP':
      return {
        ...state,
        receiveFlow: { ...state.receiveFlow, step: action.payload }
      };

    case 'UPDATE_BALANCE':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          balance: {
            ...state.wallet.balance,
            lightning: action.payload.lightning,
            fiat: action.payload.fiat
          }
        }
      };

    case 'UPDATE_TRANSACTIONS':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          transactions: action.payload
        }
      };
    
    default:
      return state;
  }
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, {
    wallet: initialWalletState,
    onboarding: initialOnboardingState,
    sendFlow: initialSendFlowState,
    receiveFlow: initialReceiveFlowState
  });

  const lightningWallet = useLightningWallet();

  const completeOnboarding = () => dispatch({ type: 'COMPLETE_ONBOARDING' });
  
  const generateWallet = async () => {
    try {
      const seedPhrase = await lightningWallet.createWallet();
      dispatch({ type: 'GENERATE_WALLET', payload: seedPhrase });
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      throw error;
    }
  };
  
  const restoreWallet = async (seedPhrase: string[]) => {
    try {
      await lightningWallet.restoreWallet(seedPhrase.join(' '));
      dispatch({ type: 'RESTORE_WALLET', payload: seedPhrase });
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      throw error;
    }
  };
  
  const confirmBackup = () => dispatch({ type: 'CONFIRM_BACKUP' });
  
  const initiateSend = (recipient: string, amount: number) => {
    dispatch({ type: 'INITIATE_SEND', payload: { recipient, amount } });
  };
  
  const confirmSend = async () => {
    try {
      if (state.sendFlow.recipient) {
        await lightningWallet.payInvoice(state.sendFlow.recipient);
        dispatch({ type: 'CONFIRM_SEND' });
      }
    } catch (error) {
      console.error('Failed to send payment:', error);
      throw error;
    }
  };
  
  const resetSendFlow = () => dispatch({ type: 'RESET_SEND_FLOW' });
  
  const generateInvoice = async (amount: number) => {
    try {
      const invoice = await lightningWallet.createInvoice(amount, 'Lightning payment');
      dispatch({ 
        type: 'GENERATE_INVOICE', 
        payload: amount,
        invoice: invoice.bolt11
      });
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  };
  
  const resetReceiveFlow = () => dispatch({ type: 'RESET_RECEIVE_FLOW' });

  const refreshLightningData = async () => {
    await lightningWallet.refreshWalletData();
  };

  const retryLastOperation = async () => {
    await lightningWallet.retryLastOperation();
  };

  // Update wallet balance and transactions when Lightning data changes
  useEffect(() => {
    if (lightningWallet.balance) {
      const fiatValue = lightningWallet.balance.balance * 0.00003; // Rough BTC to USD conversion
      dispatch({ 
        type: 'UPDATE_BALANCE', 
        payload: { 
          lightning: lightningWallet.balance.balance,
          fiat: fiatValue
        }
      });
    }
  }, [lightningWallet.balance]);

  useEffect(() => {
    if (lightningWallet.transactions.length > 0) {
      const formattedTransactions: Transaction[] = lightningWallet.transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        currency: 'SAT',
        timestamp: new Date(tx.timestamp),
        status: tx.status === 'complete' ? 'completed' : tx.status === 'failed' ? 'failed' : 'pending',
        description: tx.description,
        invoice: tx.bolt11
      }));
      
      dispatch({ type: 'UPDATE_TRANSACTIONS', payload: formattedTransactions });
    }
  }, [lightningWallet.transactions]);

  return (
    <WalletContext.Provider value={{
      wallet: state.wallet,
      onboarding: state.onboarding,
      sendFlow: state.sendFlow,
      receiveFlow: state.receiveFlow,
      
      // Lightning state
      isLightningInitialized: lightningWallet.isInitialized,
      lightningBalance: lightningWallet.balance?.balance || 0,
      lightningError: lightningWallet.errorMessage,
      isLightningLoading: lightningWallet.isLoading,
      isLightningConnecting: lightningWallet.isConnecting,
      lastSyncTime: lightningWallet.lastSyncTime,
      
      // Actions
      completeOnboarding,
      generateWallet,
      restoreWallet,
      confirmBackup,
      initiateSend,
      confirmSend,
      resetSendFlow,
      generateInvoice,
      resetReceiveFlow,
      refreshLightningData,
      retryLastOperation,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};