
import init, { defaultConfig, connect, BreezSdkLiquid } from '@breeztech/breez-sdk-liquid';

export interface BreezInvoice {
  id: string;
  bolt11: string;
  amount: number;
  description?: string;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface BreezPayment {
  id: string;
  bolt11: string;
  amount: number;
  description?: string;
  status: 'pending' | 'complete' | 'failed';
  createdAt: string;
}

export interface BreezBalance {
  balance: number;
  pendingReceive: number;
  pendingSend: number;
}

export interface BreezTransaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  description?: string;
  status: 'pending' | 'complete' | 'failed';
  timestamp: string;
  bolt11?: string;
}

export class BreezSDKService {
  private static sdk: BreezSdkLiquid | null = null;
  private static isInitialized = false;

  private static async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Initializing Breez SDK...');
      await init();
      this.isInitialized = true;
    }
  }

  static async connect(mnemonic: string): Promise<void> {
    try {
      await this.ensureInitialized();

      const apiKey = import.meta.env.VITE_BREEZ_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_BREEZ_API_KEY environment variable is not set');
      }

      console.log('Creating Breez SDK config...');
      const config = defaultConfig('mainnet', apiKey);
      
      console.log('Connecting to Breez SDK...');
      this.sdk = await connect({ mnemonic, config });
      
      console.log('Successfully connected to Breez SDK');
    } catch (error) {
      console.error('Failed to connect to Breez SDK:', error);
      throw error;
    }
  }

  private static ensureConnected(): BreezSdkLiquid {
    if (!this.sdk) {
      throw new Error('Breez SDK not connected. Call connect() first.');
    }
    return this.sdk;
  }

  static async createInvoice(
    amount: number,
    description?: string
  ): Promise<BreezInvoice> {
    try {
      console.log('Creating invoice with Breez SDK:', { amount, description });
      const sdk = this.ensureConnected();
      
      const request = {
        amountSat: amount,
        description: description || ''
      };

      const invoice = await sdk.receivePayment(request);
      
      return {
        id: invoice.id || `inv_${Date.now()}`,
        bolt11: invoice.bolt11,
        amount,
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour default
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  static async payInvoice(bolt11: string): Promise<BreezPayment> {
    try {
      console.log('Paying invoice with Breez SDK:', bolt11);
      const sdk = this.ensureConnected();
      
      const payment = await sdk.sendPayment({ bolt11 });
      
      return {
        id: payment.id || `pay_${Date.now()}`,
        bolt11,
        amount: payment.amountSat || 0,
        description: payment.description || '',
        status: 'complete',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw error;
    }
  }

  static async getBalance(): Promise<BreezBalance> {
    try {
      console.log('Getting balance from Breez SDK');
      const sdk = this.ensureConnected();
      
      const walletInfo = await sdk.getInfo();
      
      return {
        balance: walletInfo.balanceSat || 0,
        pendingReceive: walletInfo.pendingReceiveSat || 0,
        pendingSend: walletInfo.pendingSendSat || 0,
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  static async getTransactions(): Promise<BreezTransaction[]> {
    try {
      console.log('Getting transactions from Breez SDK');
      const sdk = this.ensureConnected();
      
      const payments = await sdk.listPayments({});
      
      return payments.map((payment: any) => ({
        id: payment.id || `tx_${Date.now()}`,
        type: payment.paymentType === 'receive' ? 'receive' : 'send',
        amount: payment.amountSat || 0,
        description: payment.description || '',
        status: payment.status === 'complete' ? 'complete' : 'pending',
        timestamp: new Date(payment.timestamp || Date.now()).toISOString(),
        bolt11: payment.bolt11,
      }));
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  }

  static async getInvoiceStatus(invoiceId: string): Promise<BreezInvoice> {
    try {
      console.log('Getting invoice status from Breez SDK:', invoiceId);
      const sdk = this.ensureConnected();
      
      // This would need to be implemented based on the actual SDK methods
      // For now, we'll return a mock response
      return {
        id: invoiceId,
        bolt11: `lnbc1000u1p${Math.random().toString(36).substring(2, 15)}`,
        amount: 1000,
        description: 'Invoice',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
    } catch (error) {
      console.error('Failed to get invoice status:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.sdk) {
      try {
        await this.sdk.disconnect();
        this.sdk = null;
        console.log('Disconnected from Breez SDK');
      } catch (error) {
        console.error('Failed to disconnect from Breez SDK:', error);
      }
    }
  }
}
