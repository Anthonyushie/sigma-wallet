
export interface WalletBalance {
  bitcoin: number;
  lightning: number;
  fiat: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: 'BTC' | 'SAT';
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
  txHash?: string;
  invoice?: string;
}

export interface WalletState {
  isOnboarded: boolean;
  hasBackup: boolean;
  balance: WalletBalance;
  transactions: Transaction[];
}

export interface OnboardingStep {
  step: 'create' | 'restore' | 'backup' | 'complete';
  seedPhrase?: string[];
  isVerified?: boolean;
}

export interface SendFlowState {
  step: 'input' | 'confirm' | 'success' | 'error';
  recipient?: string;
  amount?: number;
  invoice?: string;
  error?: string;
}

export interface ReceiveFlowState {
  step: 'amount' | 'invoice' | 'complete';
  amount?: number;
  invoice?: string;
  qrCode?: string;
}
