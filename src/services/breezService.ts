import init, {
  connect,
  defaultConfig,
  PaymentState,
  SdkEvent
} from '@breeztech/breez-sdk-liquid/web';
import * as bip39 from 'bip39';

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

export class BreezService {
  private static instance: BreezService;
  private sdk: any = null;
  private isInitialized = false;
  private initializedWasm = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): BreezService {
    if (!BreezService.instance) {
      BreezService.instance = new BreezService();
    }
    return BreezService.instance;
  }

  // Ensure WASM init runs once and handle memory issues
  private async ensureWasmInit(): Promise<void> {
    if (this.initializedWasm) {
      return;
    }

    try {
      await init();
      this.initializedWasm = true;
      console.log('WASM initialized successfully');
    } catch (error) {
      console.error('WASM initialization failed:', error);
      throw new Error('Failed to initialize WASM module');
    }
  }

  async initialize(mnemonic: string): Promise<void> {
    // Prevent multiple concurrent initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize(mnemonic);
    return this.initializationPromise;
  }

  private async _initialize(mnemonic: string): Promise<void> {
    try {
      if (this.isInitialized && this.sdk) {
        return;
      }

      console.log('Initializing Breez SDK...');
      
      // Clean up any existing state first
      await this.cleanup();

      // Initialize WASM with proper error handling
      await this.ensureWasmInit();

      // Get certificate from environment - only using certificate auth
      const breezCertificate = import.meta.env.VITE_BREEZ_CERTIFICATE || '';
      
      // Require certificate authentication
      if (!breezCertificate) {
        throw new Error('BREEZ_AUTH_MISSING: No Breez certificate provided. Please set VITE_BREEZ_CERTIFICATE in your environment variables.');
      }

      // Validate mnemonic before proceeding
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('INVALID_MNEMONIC: Invalid mnemonic phrase');
      }

      const config = await defaultConfig("mainnet");
      
      // Set certificate for authentication
      config.breezApiKey = breezCertificate;

      // Convert mnemonic to seed
      const seed = this.mnemonicToSeed(mnemonic);

      // Connect with timeout and memory protection
      const connectPromise = connect({
        config,
        seed: Array.from(seed)
      });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 30000);
      });

      this.sdk = await Promise.race([connectPromise, timeoutPromise]);
      
      this.isInitialized = true;
      console.log('Breez SDK initialized successfully');
      
      // Perform initial sync with error handling
      try {
        await this.sync();
      } catch (syncError) {
        console.warn('Initial sync failed, continuing anyway:', syncError);
      }

    } catch (error) {
      console.error('Failed to initialize Breez SDK:', error);
      await this.cleanup();
      
      // Enhanced error categorization
      if (error instanceof Error) {
        if (error.message.includes('BREEZ_AUTH_MISSING')) {
          throw error;
        } else if (error.message.includes('INVALID_MNEMONIC')) {
          throw error;
        } else if (error.message.includes('timeout')) {
          throw new Error(`TIMEOUT_ERROR: Breez SDK connection timed out: ${error.message}`);
        } else if (error.message.includes('memory access out of bounds')) {
          throw new Error(`MEMORY_ERROR: WASM memory access error: ${error.message}`);
        } else if (error.message.includes('prepareResponse') || error.message.includes('missing field')) {
          throw new Error(`SERIALIZATION_ERROR: Breez SDK data format error: ${error.message}`);
        } else if (error.message.includes('unreachable')) {
          throw new Error(`WASM_ERROR: WASM execution error: ${error.message}`);
        } else {
          throw new Error(`BREEZ_SDK_ERROR: Breez SDK initialization failed: ${error.message}`);
        }
      }
      throw new Error('UNKNOWN_ERROR: Unknown error during Breez SDK initialization');
    } finally {
      this.initializationPromise = null;
    }
  }

  private mnemonicToSeed(mnemonic: string): Uint8Array {
    try {
      const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
      return new Uint8Array(seedBuffer.slice(0, 32));
    } catch (error) {
      throw new Error('Failed to convert mnemonic to seed');
    }
  }

  async getWalletInfo(): Promise<BreezWalletState> {
    if (!this.sdk || !this.isInitialized) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      console.log('Calling SDK getInfo...');
      const info = await this.sdk.getInfo();
      console.log('SDK getInfo response:', info);
      
      return {
        isConnected: true,
        balance: info.balanceSat || 0,
        pendingReceive: info.pendingReceiveSat || 0,
        pendingSend: info.pendingSendSat || 0
      };
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Handle specific serialization errors
      if (error instanceof Error && error.message.includes('prepareResponse')) {
        throw new Error('SERIALIZATION_ERROR: Failed to parse wallet info response');
      }
      throw error;
    }
  }

  async createInvoice(amountSats: number, description?: string): Promise<BreezInvoice> {
    if (!this.sdk || !this.isInitialized) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      const amountMsat = amountSats * 1000;

      console.log('Creating invoice with params:', { amountSats, amountMsat, description });

      // Step 1: Prepare the receive payment request with correct BOLT11 format
      const prepareRequest = {
        paymentMethod: "bolt11Invoice", // Use bolt11Invoice variant for BOLT11 invoices
        payerAmountSat: amountSats, // Bitcoin payer amount for Liquid Lightning
        description: description || 'Lightning payment'
      };

      console.log('Calling SDK prepareReceivePayment with:', prepareRequest);

      // Use prepareReceivePayment first
      const prepareResponse = await this.sdk.prepareReceivePayment(prepareRequest);
      console.log('SDK prepareReceivePayment response:', prepareResponse);

      // Step 2: Execute the receive payment with the prepared response
      console.log('Calling SDK receivePayment with prepareResponse');
      const invoiceResponse = await this.sdk.receivePayment({
        prepareResponse: prepareResponse
      });
      console.log('SDK receivePayment final response:', invoiceResponse);

      // Extract the invoice data
      const invoice = invoiceResponse;
      console.log('Parsed invoice in createInvoice:', invoice);

      if (!invoice.bolt11 || !invoice.paymentHash) {
        throw new Error('INVOICE_RESPONSE_INVALID: Missing bolt11 or paymentHash in SDK response');
      }

      return {
        bolt11: invoice.bolt11,
        paymentHash: invoice.paymentHash,
        amountMsat
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      // Handle specific serialization errors
      if (error instanceof Error && error.message.includes('prepareResponse')) {
        throw new Error('SERIALIZATION_ERROR: Failed to parse invoice response');
      }
      throw error;
    }
  }

  async payInvoice(bolt11: string): Promise<BreezPayment> {
    if (!this.sdk || !this.isInitialized) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      if (!this.isValidLightningInvoice(bolt11)) {
        throw new Error('Invalid Lightning invoice format');
      }

      console.log('Paying invoice:', bolt11);

      // First prepare the payment
      const prepareRequest = { bolt11 };
      console.log('Calling SDK sendPayment with:', prepareRequest);
      
      const payment = await this.sdk.sendPayment(prepareRequest);
      console.log('SDK sendPayment response:', payment);

      return {
        paymentHash: payment.paymentHash,
        status: payment.status,
        amountMsat: payment.amountMsat
      };
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Handle specific serialization errors
      if (error instanceof Error && error.message.includes('prepareResponse')) {
        throw new Error('SERIALIZATION_ERROR: Failed to parse payment response');
      }
      throw error;
    }
  }

  private isValidLightningInvoice(invoice: string): boolean {
    const lowerInvoice = invoice.toLowerCase();
    return (
      lowerInvoice.startsWith('lnbc') ||
      lowerInvoice.startsWith('lntb') ||
      lowerInvoice.startsWith('lnbcrt')
    ) && invoice.length > 20;
  }

  async sync(): Promise<void> {
    if (!this.sdk || !this.isInitialized) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      console.log('Syncing wallet...');
      await this.sdk.sync();
      console.log('Wallet synced successfully');
    } catch (error) {
      console.error('Failed to sync:', error);
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    if (this.sdk) {
      try {
        // Attempt graceful cleanup
        console.log('Cleaning up Breez SDK...');
        this.sdk = null;
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    this.isInitialized = false;
  }

  async disconnect(): Promise<void> {
    await this.cleanup();
    this.initializationPromise = null;
  }

  isReady(): boolean {
    return this.isInitialized && this.sdk !== null;
  }
}

export const breezService = BreezService.getInstance();
