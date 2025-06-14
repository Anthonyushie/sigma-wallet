import { 
  connect, 
  defaultConfig,
  LiquidNetwork,
  prepareReceivePayment,
  receivePayment,
  prepareSendPayment,
  sendPayment,
  sync,
  getInfo,
  PaymentState
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

// Certificate for Breez authentication
const BREEZ_CERTIFICATE = `MIIBfjCCATCgAwIBAgIHPh1T9W3eozAFBgMrZXAwEDEOMAwGA1UEAxMFQnJlZXowHhcNMjUwNTI3MTgxMTM5WhcNMzUwNTI1MTgxMTM5WjArMRAwDgYDVQQKEwdpUGF5QlRDMRcwFQYDVQQDEw5BbnRob255ICBVc2hpZTAqMAUGAytlcAMhANCD9cvfIDwcoiDKKYdT9BunHLS2/OuKzV8NS0SzqV13o4GNMIGKMA4GA1UdDwEB/wQEAwIFoDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTaOaPuXmtLDTJVv++VYBiQr9gHCTAfBgNVHSMEGDAWgBTeqtaSVvON53SSFvxMtiCyayiYazAqBgNVHREEIzAhgR9hbnRob255dHdhbjc1b2ZmaWNpYWxAZ21haWwuY29t`;

export class BreezService {
  private static instance: BreezService;
  private sdk: any = null;
  private isInitialized = false;

  static getInstance(): BreezService {
    if (!BreezService.instance) {
      BreezService.instance = new BreezService();
    }
    return BreezService.instance;
  }

  async initialize(mnemonic: string): Promise<void> {
    try {
      if (this.isInitialized && this.sdk) {
        return;
      }

      console.log('Initializing Breez SDK with proper configuration...');
      
      // Create config with proper network enum
      const config = await defaultConfig(LiquidNetwork.MAINNET);
      config.breezApiKey = BREEZ_CERTIFICATE;

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
      throw new Error(`Breez SDK initialization failed: ${error.message}`);
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
      const walletInfo = await getInfo();
      return {
        isConnected: true,
        balance: walletInfo.balanceSat || 0,
        pendingReceive: walletInfo.pendingReceiveSat || 0,
        pendingSend: walletInfo.pendingSendSat || 0
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

      // Prepare receive payment
      const prepareResponse = await prepareReceivePayment({
        amountMsat,
        description: description || 'Lightning payment'
      });

      // Execute receive payment
      const invoice = await receivePayment({
        prepareResponse
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
      // Validate Lightning invoice format
      if (!this.isValidLightningInvoice(bolt11)) {
        throw new Error('Invalid Lightning invoice format');
      }

      // Prepare send payment
      const prepareResponse = await prepareSendPayment({
        bolt11
      });

      // Execute send payment
      const payment = await sendPayment({
        prepareResponse
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
      lowerInvoice.startsWith('lnbc') || // Bitcoin mainnet
      lowerInvoice.startsWith('lntb') || // Bitcoin testnet
      lowerInvoice.startsWith('lnbcrt') // Bitcoin regtest
    ) && invoice.length > 20;
  }

  async sync(): Promise<void> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      await sync();
      console.log('Wallet synced successfully');
    } catch (error) {
      console.error('Failed to sync:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sdk) {
      try {
        // Breez SDK will handle cleanup automatically
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
