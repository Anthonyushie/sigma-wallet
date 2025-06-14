
// Mock WebLN service - no longer connects to actual WebLN providers

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
  private static connected = false;

  static async connect(): Promise<void> {
    console.log('Mock WebLN: Simulating connection...');
    this.connected = true;
    console.log('Mock WebLN: Successfully connected');
  }

  static async createInvoice(
    amount: number,
    description?: string
  ): Promise<WebLNInvoice> {
    console.log('Mock WebLN: Creating invoice:', { amount, description });
    
    return {
      id: `invoice_${Date.now()}`,
      bolt11: `lnbc${amount}u1pwrp5z5pp5rw8awzpnz2drg9fhz2t3c5w4u8q7hnpm9pjq8wg7rwm6lczjl2qqsqjpgx`,
      amount,
      description: description || 'Lightning payment',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  static async payInvoice(bolt11: string): Promise<WebLNPayment> {
    console.log('Mock WebLN: Paying invoice:', bolt11);
    
    return {
      id: `payment_${Date.now()}`,
      bolt11,
      amount: 0,
      description: 'Lightning payment',
      status: 'complete',
      createdAt: new Date().toISOString(),
    };
  }

  static async getBalance(): Promise<WebLNBalance> {
    console.log('Mock WebLN: Getting balance');
    
    return {
      balance: 25000,
      pendingReceive: 0,
      pendingSend: 0,
    };
  }

  static async getTransactions(): Promise<WebLNTransaction[]> {
    console.log('Mock WebLN: Getting transactions');
    
    return [
      {
        id: '1',
        type: 'receive',
        amount: 10000,
        description: 'Lightning payment received',
        status: 'complete',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        type: 'send',
        amount: 5000,
        description: 'Lightning payment sent',
        status: 'complete',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      }
    ];
  }

  static async getInvoiceStatus(invoiceId: string): Promise<WebLNInvoice> {
    console.log('Mock WebLN: Getting invoice status:', invoiceId);
    throw new Error('Invoice not found');
  }

  static async disconnect(): Promise<void> {
    this.connected = false;
    console.log('Mock WebLN: Disconnected');
  }

  static async sync(): Promise<void> {
    console.log('Mock WebLN: Sync completed');
  }

  static isConnected(): boolean {
    return this.connected;
  }
}
