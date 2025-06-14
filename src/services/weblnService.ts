
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
  private static isConnected = false;

  static async connect(): Promise<void> {
    try {
      console.log('Connecting to WebLN provider...');
      this.provider = await requestProvider();
      await this.provider.enable();
      this.isConnected = true;
      console.log('Successfully connected to WebLN provider');
    } catch (error) {
      console.error('Failed to connect to WebLN provider:', error);
      throw new Error(`WebLN connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static ensureConnected(): void {
    if (!this.provider || !this.isConnected) {
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
      
      // WebLN doesn't have a standard balance method, so we'll return mock data
      // In a real implementation, you'd need to use the specific wallet's API
      return {
        balance: 100000, // Mock 100k sats
        pendingReceive: 0,
        pendingSend: 0,
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error(`Balance retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTransactions(): Promise<WebLNTransaction[]> {
    try {
      console.log('Getting transactions from WebLN');
      this.ensureConnected();
      
      // WebLN doesn't have a standard transaction history method
      // Return empty array for now
      return [];
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw new Error(`Transaction retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      this.isConnected = false;
      console.log('Disconnected from WebLN provider');
    }
  }

  static async sync(): Promise<void> {
    // WebLN doesn't require syncing
    console.log('WebLN sync completed (no-op)');
  }

  static isConnected(): boolean {
    return this.isConnected && this.provider !== null;
  }
}
