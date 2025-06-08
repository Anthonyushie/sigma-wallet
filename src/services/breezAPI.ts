
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

export class BreezAPIService {
  private static readonly BASE_URL = 'https://api.breez.technology';
  private static readonly API_KEY = 'your_api_key_here';

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Breez API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async createInvoice(
    amount: number,
    description?: string
  ): Promise<BreezInvoice> {
    console.log('Creating invoice:', { amount, description });
    
    // Mock response for development - replace with actual API call
    const mockInvoice: BreezInvoice = {
      id: `inv_${Date.now()}`,
      bolt11: `lnbc${amount}u1p${Math.random().toString(36).substring(2, 15)}`,
      amount,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    };

    return mockInvoice;

    // Uncomment when using real API:
    /*
    return this.makeRequest<BreezInvoice>('/v1/invoices', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        description,
      }),
    });
    */
  }

  static async payInvoice(bolt11: string): Promise<BreezPayment> {
    console.log('Paying invoice:', bolt11);
    
    // Mock response for development - replace with actual API call
    const mockPayment: BreezPayment = {
      id: `pay_${Date.now()}`,
      bolt11,
      amount: 1000, // Mock amount
      description: 'Payment',
      status: 'complete',
      createdAt: new Date().toISOString(),
    };

    return mockPayment;

    // Uncomment when using real API:
    /*
    return this.makeRequest<BreezPayment>('/v1/payments', {
      method: 'POST',
      body: JSON.stringify({
        bolt11,
      }),
    });
    */
  }

  static async getBalance(): Promise<BreezBalance> {
    console.log('Getting balance');
    
    // Mock response for development - replace with actual API call
    const mockBalance: BreezBalance = {
      balance: 45000,
      pendingReceive: 0,
      pendingSend: 0,
    };

    return mockBalance;

    // Uncomment when using real API:
    /*
    return this.makeRequest<BreezBalance>('/v1/balance');
    */
  }

  static async getTransactions(): Promise<BreezTransaction[]> {
    console.log('Getting transactions');
    
    // Mock response for development - replace with actual API call
    const mockTransactions: BreezTransaction[] = [
      {
        id: '1',
        type: 'receive',
        amount: 21000,
        description: 'Lightning payment',
        status: 'complete',
        timestamp: new Date('2024-06-07T10:30:00').toISOString(),
      },
      {
        id: '2',
        type: 'send',
        amount: 5000,
        description: 'Coffee payment',
        status: 'complete',
        timestamp: new Date('2024-06-06T15:45:00').toISOString(),
      },
    ];

    return mockTransactions;

    // Uncomment when using real API:
    /*
    return this.makeRequest<BreezTransaction[]>('/v1/transactions');
    */
  }

  static async getInvoiceStatus(invoiceId: string): Promise<BreezInvoice> {
    console.log('Getting invoice status:', invoiceId);
    
    // Mock response for development - replace with actual API call
    const mockInvoice: BreezInvoice = {
      id: invoiceId,
      bolt11: `lnbc1000u1p${Math.random().toString(36).substring(2, 15)}`,
      amount: 1000,
      description: 'Test invoice',
      status: 'paid',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    return mockInvoice;

    // Uncomment when using real API:
    /*
    return this.makeRequest<BreezInvoice>(`/v1/invoices/${invoiceId}`);
    */
  }
}
