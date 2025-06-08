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
}

const initialWalletState: WalletState = {
  isOnboarded: false,
  hasBackup: false,
  balance: {
    bitcoin: 0.00234567,
    lightning: 45000,
    fiat: 156.78,
    currency: 'USD'
  },
  transactions: [
    {
      id: '1',
      type: 'receive',
      amount: 21000,
      currency: 'SAT',
      timestamp: new Date('2024-06-07T10:30:00'),
      status: 'completed',
      description: 'Lightning payment'
    },
    {
      id: '2',
      type: 'send',
      amount: 0.001,
      currency: 'BTC',
      timestamp: new Date('2024-06-06T15:45:00'),
      status: 'completed',
      description: 'On-chain transaction'
    },
    {
      id: '3',
      type: 'receive',
      amount: 5000,
      currency: 'SAT',
      timestamp: new Date('2024-06-05T09:15:00'),
      status: 'pending',
      description: 'Lightning payment'
    }
  ]
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
  | { type: 'SET_RECEIVE_STEP'; payload: ReceiveFlowState['step'] };

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
          qrCode: action.invoice // Use the actual invoice as QR data
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

  // Update wallet balance when Lightning data changes
  useEffect(() => {
    if (lightningWallet.balance) {
      // Update the wallet state with real Lightning balance
      const updatedWallet = {
        ...state.wallet,
        balance: {
          ...state.wallet.balance,
          lightning: lightningWallet.balance.balance,
        }
      };
      // This would require updating the reducer to handle balance updates
    }
  }, [lightningWallet.balance]);

  return (
    <WalletContext.Provider value={{
      wallet: state.wallet,
      onboarding: state.onboarding,
      sendFlow: state.sendFlow,
      receiveFlow: state.receiveFlow,
      
      // Lightning state
      isLightningInitialized: lightningWallet.isInitialized,
      lightningBalance: lightningWallet.balance?.balance || 0,
      lightningError: lightningWallet.error,
      isLightningLoading: lightningWallet.isLoading,
      
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
