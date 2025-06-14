import { requestProvider } from 'webln';

export interface WebLNInvoice {
  id: string;
  bolt11: string;
  amount: number;
  description?: string;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface WebLNPayment {
  id: string;
  bolt11: string;
  amount: number;
  description?: string;
  status: 'pending' | 'complete' | 'failed';
  createdAt: string;
}

export interface WebLNBalance {
  balance: number;
  pendingReceive: number;
  pendingSend: number;
}

export interface WebLNTransaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  description?: string;
  status: 'pending' | 'complete' | 'failed';
  timestamp: string;
  bolt11?: string;
}

export class WebLNService {
  private static provider: any = null;
  private static connected = false;

  static async connect(): Promise<void> {
    try {
      console.log('Connecting to WebLN provider...');
      this.provider = await requestProvider();
      await this.provider.enable();
      this.connected = true;
      console.log('Successfully connected to WebLN provider');
    } catch (error) {
      console.error('Failed to connect to WebLN provider:', error);
      throw new Error(`WebLN connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static ensureConnected(): void {
    if (!this.provider || !this.connected) {
      throw new Error('WebLN provider not connected. Call connect() first.');
    }
  }

  static async createInvoice(
    amount: number,
    description?: string
  ): Promise<WebLNInvoice> {
    try {
      console.log('Creating invoice with WebLN:', { amount, description });
      this.ensureConnected();
      
      const invoice = await this.provider.makeInvoice({
        amount: amount,
        defaultMemo: description || 'Lightning payment'
      });
      
      return {
        id: `invoice_${Date.now()}`,
        bolt11: invoice.paymentRequest,
        amount,
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw new Error(`Invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async payInvoice(bolt11: string): Promise<WebLNPayment> {
    try {
      console.log('Paying invoice with WebLN:', bolt11);
      this.ensureConnected();
      
      const payment = await this.provider.sendPayment(bolt11);
      
      return {
        id: payment.preimage || `payment_${Date.now()}`,
        bolt11,
        amount: 0, // WebLN doesn't always provide amount in response
        description: 'Lightning payment',
        status: payment.preimage ? 'complete' : 'pending',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getBalance(): Promise<WebLNBalance> {
    try {
      console.log('Getting balance from WebLN');
      this.ensureConnected();
      
      // Try to get balance from provider if it supports it
      if (this.provider && typeof this.provider.getBalance === 'function') {
        const balance = await this.provider.getBalance();
        return {
          balance: balance.balance || 0,
          pendingReceive: balance.pendingReceive || 0,
          pendingSend: balance.pendingSend || 0,
        };
      }
      
      // If provider doesn't support getBalance, try getInfo
      if (this.provider && typeof this.provider.getInfo === 'function') {
        const info = await this.provider.getInfo();
        return {
          balance: info.balance || 0,
          pendingReceive: 0,
          pendingSend: 0,
        };
      }
      
      // If no balance methods available, return zero balance
      console.warn('WebLN provider does not support balance retrieval');
      return {
        balance: 0,
        pendingReceive: 0,
        pendingSend: 0,
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      // Return zero balance instead of throwing error to prevent app crashes
      return {
        balance: 0,
        pendingReceive: 0,
        pendingSend: 0,
      };
    }
  }

  static async getTransactions(): Promise<WebLNTransaction[]> {
    try {
      console.log('Getting transactions from WebLN');
      this.ensureConnected();
      
      // Try to get transactions from provider if it supports it
      if (this.provider && typeof this.provider.getTransactions === 'function') {
        const transactions = await this.provider.getTransactions();
        return transactions.map((tx: any) => ({
          id: tx.id || `tx_${Date.now()}`,
          type: tx.type || 'receive',
          amount: tx.amount || 0,
          description: tx.description || 'Lightning transaction',
          status: tx.status || 'complete',
          timestamp: tx.timestamp || new Date().toISOString(),
          bolt11: tx.bolt11,
        }));
      }
      
      // If no transaction method available, return empty array
      console.warn('WebLN provider does not support transaction history');
      return [];
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  static async getInvoiceStatus(invoiceId: string): Promise<WebLNInvoice> {
    try {
      console.log('Getting invoice status from WebLN:', invoiceId);
      this.ensureConnected();
      
      // Mock implementation - WebLN doesn't have standard invoice status checking
      throw new Error('Invoice not found');
    } catch (error) {
      console.error('Failed to get invoice status:', error);
      throw new Error(`Invoice status retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async disconnect(): Promise<void> {
    if (this.provider) {
      this.provider = null;
      this.connected = false;
      console.log('Disconnected from WebLN provider');
    }
  }

  static async sync(): Promise<void> {
    // WebLN doesn't require syncing
    console.log('WebLN sync completed (no-op)');
  }

  static isConnected(): boolean {
    return this.connected && this.provider !== null;
  }
}
