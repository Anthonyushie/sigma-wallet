
import { PaymentState } from '@breeztech/breez-sdk-liquid/web';

export interface BreezWalletState {
  isConnected: boolean;
  balance: number;
  pendingReceive: number;
  pendingSend: number;
}

export interface BreezInvoice {
  bolt11: string;
  paymentHash: string;
  amountMsat: number;
}

export interface BreezPayment {
  paymentHash: string;
  status: PaymentState;
  amountMsat: number;
}
