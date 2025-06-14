
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

  static getInstance(): BreezService {
    if (!BreezService.instance) {
      BreezService.instance = new BreezService();
    }
    return BreezService.instance;
  }

  // Ensure WASM init runs once before SDK logic
  private async ensureWasmInit(): Promise<void> {
    if (!this.initializedWasm) {
      await init();
      this.initializedWasm = true;
    }
  }

  async initialize(mnemonic: string): Promise<void> {
    try {
      if (this.isInitialized && this.sdk) {
        return;
      }

      // Always initialize the WASM first!
      await this.ensureWasmInit();

      console.log('Initializing Breez SDK...');
      
      // Get certificate from environment or use empty string as fallback
      const breezCertificate = import.meta.env.VITE_BREEZ_CERTIFICATE || '';
      const breezApiKey = import.meta.env.VITE_BREEZ_API_KEY || '';
      
      // If no valid certificate is provided, throw a specific error
      if (!breezCertificate && !breezApiKey) {
        throw new Error('No Breez authentication provided. Please set VITE_BREEZ_CERTIFICATE or VITE_BREEZ_API_KEY in your environment variables.');
      }

      // Use "mainnet" string as websocket expects string not enum in Breez SDK
      const config = await defaultConfig("mainnet");
      
      // Set the authentication method
      if (breezCertificate) {
        config.breezApiKey = breezCertificate;
      } else if (breezApiKey) {
        config.breezApiKey = breezApiKey;
      }

      // Convert mnemonic to proper seed using BIP39
      const seed = this.mnemonicToSeed(mnemonic);

      // Connect to Breez SDK
      this.sdk = await connect({
        config,
        seed: Array.from(seed)
      });
      
      this.isInitialized = true;
      console.log('Breez SDK initialized successfully');
      
      // Perform initial sync
      await this.sync();
    } catch (error) {
      console.error('Failed to initialize Breez SDK:', error);
      throw new Error(`Breez SDK initialization failed: ${(error as Error).message}`);
    }
  }

  private mnemonicToSeed(mnemonic: string): Uint8Array {
    // Use BIP39 to convert mnemonic to seed
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
    return new Uint8Array(seedBuffer.slice(0, 32)); // Take first 32 bytes
  }

  async getWalletInfo(): Promise<BreezWalletState> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      const info = await this.sdk.getInfo();
      return {
        isConnected: true,
        balance: info.balanceSat || 0,
        pendingReceive: info.pendingReceiveSat || 0,
        pendingSend: info.pendingSendSat || 0
      };
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      throw error;
    }
  }

  async createInvoice(amountSats: number, description?: string): Promise<BreezInvoice> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      // Convert sats to millisats
      const amountMsat = amountSats * 1000;

      // Use receivePayment directly (per SDK docs)
      const invoice = await this.sdk.receivePayment({
        amountMsat,
        description: description || 'Lightning payment'
      });

      return {
        bolt11: invoice.bolt11,
        paymentHash: invoice.paymentHash,
        amountMsat
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  async payInvoice(bolt11: string): Promise<BreezPayment> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      if (!this.isValidLightningInvoice(bolt11)) {
        throw new Error('Invalid Lightning invoice format');
      }

      // Use sendPayment directly (per SDK docs)
      const payment = await this.sdk.sendPayment({
        bolt11
      });

      return {
        paymentHash: payment.paymentHash,
        status: payment.status,
        amountMsat: payment.amountMsat
      };
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw error;
    }
  }

  private isValidLightningInvoice(invoice: string): boolean {
    // Check if it's a valid BOLT11 invoice format
    const lowerInvoice = invoice.toLowerCase();
    return (
      lowerInvoice.startsWith('lnbc') ||
      lowerInvoice.startsWith('lntb') ||
      lowerInvoice.startsWith('lnbcrt')
    ) && invoice.length > 20;
  }

  async sync(): Promise<void> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      await this.sdk.sync();
      console.log('Wallet synced successfully');
    } catch (error) {
      console.error('Failed to sync:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sdk) {
      try {
        console.log('Disconnecting from Breez SDK');
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
    this.sdk = null;
    this.isInitialized = false;
  }

  isReady(): boolean {
    return this.isInitialized && this.sdk !== null;
  }
}

export const breezService = BreezService.getInstance();
