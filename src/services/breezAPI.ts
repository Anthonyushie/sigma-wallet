
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
  private static readonly API_KEY = 'MIIBfjCCATCgAwIBAgIHPh1T9W3eozAFBgMrZXAwEDEOMAwGA1UEAxMFQnJlZXowHhcNMjUwNTI3MTgxMTM5WhcNMzUwNTI1MTgxMTM5WjArMRAwDgYDVQQKEwdpUGF5QlRDMRcwFQYDVQQDEw5BbnRob255ICBVc2hpZTAqMAUGAytlcAMhANCD9cvfIDwcoiDKKYdT9BunHLS2/OuKzV8NS0SzqV13o4GNMIGKMA4GA1UdDwEB/wQEAwIFoDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTaOaPuXmtLDTJVv++VYBiQr9gHCTAfBgNVHSMEGDAWgBTeqtaSVvON53SSFvxMtiCyayiYazAqBgNVHREEIzAhgR9hbnRob255dHdhbjc1b2ZmaWNpYWxAZ21haWwuY29tMAUGAytlcANBAMeVKtqppAVc0tVWDWnCFhstHvqoSES+cJnbwVGVExmcPckSxEaTFJ4U2zvUeyQyGPy/Ifotm178YMuDWVQ63Q8=';

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
    
    return this.makeRequest<BreezInvoice>('/v1/invoices', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        description,
      }),
    });
  }

  static async payInvoice(bolt11: string): Promise<BreezPayment> {
    console.log('Paying invoice:', bolt11);
    
    return this.makeRequest<BreezPayment>('/v1/payments', {
      method: 'POST',
      body: JSON.stringify({
        bolt11,
      }),
    });
  }

  static async getBalance(): Promise<BreezBalance> {
    console.log('Getting balance');
    
    return this.makeRequest<BreezBalance>('/v1/balance');
  }

  static async getTransactions(): Promise<BreezTransaction[]> {
    console.log('Getting transactions');
    
    return this.makeRequest<BreezTransaction[]>('/v1/transactions');
  }

  static async getInvoiceStatus(invoiceId: string): Promise<BreezInvoice> {
    console.log('Getting invoice status:', invoiceId);
    
    return this.makeRequest<BreezInvoice>(`/v1/invoices/${invoiceId}`);
  }
}
