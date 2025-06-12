import { 
  defaultConfig, 
  connect, 
  Config,
  ReceivePaymentRequest,
  PrepareReceivePaymentRequest,
  PrepareReceivePaymentResponse,
  SendPaymentRequest,
  PrepareSendPaymentRequest,
  PrepareSendPaymentResponse,
  PaymentState,
  Payment,
  GetInfoResponse,
  LiquidNetwork
} from '@breeztech/breez-sdk-liquid';

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
  private static sdk: any | null = null;
  private static isInitialized = false;
  private static config: Config | null = null;

  private static async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Initializing Breez SDK...');
      
      const apiKey = import.meta.env.VITE_BREEZ_API_KEY;
      const network = import.meta.env.VITE_BREEZ_NETWORK || 'mainnet';
      
      if (!apiKey) {
        throw new Error('VITE_BREEZ_API_KEY environment variable is not set');
      }

      // Create configuration for mainnet
      this.config = defaultConfig(
        network === 'mainnet' ? LiquidNetwork.MAINNET : LiquidNetwork.TESTNET,
        apiKey
      );
      
      this.isInitialized = true;
      console.log(`Breez SDK initialized for ${network}`);
    }
  }

  static async connect(mnemonic: string): Promise<void> {
    try {
      await this.ensureInitialized();

      if (!this.config) {
        throw new Error('Breez SDK configuration not initialized');
      }

      console.log('Connecting to Breez SDK...');
      
      // Connect to the Breez SDK with mnemonic and config
      this.sdk = await connect({
        mnemonic,
        config: this.config
      });
      
      console.log('Successfully connected to Breez SDK');
    } catch (error) {
      console.error('Failed to connect to Breez SDK:', error);
      throw new Error(`Breez SDK connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static ensureConnected(): any {
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
      
      // Prepare receive payment request
      const prepareRequest: PrepareReceivePaymentRequest = {
        paymentMethod: {
          type: 'lightning',
          invoiceAmountMsat: amount * 1000 // Convert sats to millisats
        }
      };

      const prepareResponse: PrepareReceivePaymentResponse = await sdk.prepareReceivePayment(prepareRequest);
      
      // Create the actual receive payment request
      const receiveRequest: ReceivePaymentRequest = {
        prepareResponse,
        description: description || 'Lightning payment'
      };

      const receiveResponse = await sdk.receivePayment(receiveRequest);
      
      return {
        id: receiveResponse.id,
        bolt11: receiveResponse.destination,
        amount,
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour default
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw new Error(`Invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async payInvoice(bolt11: string): Promise<BreezPayment> {
    try {
      console.log('Paying invoice with Breez SDK:', bolt11);
      const sdk = this.ensureConnected();
      
      // Prepare send payment request
      const prepareRequest: PrepareSendPaymentRequest = {
        destination: bolt11
      };

      const prepareResponse: PrepareSendPaymentResponse = await sdk.prepareSendPayment(prepareRequest);
      
      // Create the actual send payment request
      const sendRequest: SendPaymentRequest = {
        prepareResponse
      };

      const sendResponse = await sdk.sendPayment(sendRequest);
      
      return {
        id: sendResponse.payment.id,
        bolt11,
        amount: Math.floor(sendResponse.payment.amountMsat / 1000), // Convert millisats to sats
        description: sendResponse.payment.description || 'Lightning payment',
        status: sendResponse.payment.paymentState === PaymentState.COMPLETE ? 'complete' : 'pending',
        createdAt: new Date(sendResponse.payment.timestamp * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getBalance(): Promise<BreezBalance> {
    try {
      console.log('Getting balance from Breez SDK');
      const sdk = this.ensureConnected();
      
      const info: GetInfoResponse = await sdk.getInfo();
      
      return {
        balance: Math.floor(info.balanceSat),
        pendingReceive: Math.floor(info.pendingReceiveSat),
        pendingSend: Math.floor(info.pendingSendSat),
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error(`Balance retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTransactions(): Promise<BreezTransaction[]> {
    try {
      console.log('Getting transactions from Breez SDK');
      const sdk = this.ensureConnected();
      
      const payments: Payment[] = await sdk.listPayments({});
      
      return payments.map(payment => ({
        id: payment.id,
        type: payment.paymentType === 'receive' ? 'receive' : 'send',
        amount: Math.floor(payment.amountMsat / 1000), // Convert millisats to sats
        description: payment.description || 'Lightning payment',
        status: payment.paymentState === PaymentState.COMPLETE ? 'complete' : 
                payment.paymentState === PaymentState.FAILED ? 'failed' : 'pending',
        timestamp: new Date(payment.timestamp * 1000).toISOString(),
        bolt11: payment.destination,
      }));
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw new Error(`Transaction retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getInvoiceStatus(invoiceId: string): Promise<BreezInvoice> {
    try {
      console.log('Getting invoice status from Breez SDK:', invoiceId);
      const sdk = this.ensureConnected();
      
      const payments = await sdk.listPayments({});
      const payment = payments.find(p => p.id === invoiceId);
      
      if (!payment) {
        throw new Error('Invoice not found');
      }
      
      return {
        id: payment.id,
        bolt11: payment.destination || '',
        amount: Math.floor(payment.amountMsat / 1000),
        description: payment.description,
        status: payment.paymentState === PaymentState.COMPLETE ? 'paid' : 
                payment.paymentState === PaymentState.FAILED ? 'expired' : 'pending',
        createdAt: new Date(payment.timestamp * 1000).toISOString(),
        expiresAt: new Date(payment.timestamp * 1000 + 3600000).toISOString(),
      };
    } catch (error) {
      console.error('Failed to get invoice status:', error);
      throw new Error(`Invoice status retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  static async sync(): Promise<void> {
    try {
      const sdk = this.ensureConnected();
      await sdk.sync();
      console.log('Breez SDK synchronized');
    } catch (error) {
      console.error('Failed to sync Breez SDK:', error);
      throw new Error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static isConnected(): boolean {
    return this.sdk !== null;
  }
}