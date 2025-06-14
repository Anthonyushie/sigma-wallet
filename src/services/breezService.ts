
import { 
  connect, 
  defaultConfig, 
  mnemonicToSeed,
  BreezEvent,
  EventListener,
  LiquidNetwork,
  Config,
  LiquidSdk,
  PrepareReceiveRequest,
  PrepareReceiveResponse,
  PrepareSendRequest,
  PrepareSendResponse,
  ReceivePaymentRequest,
  SendPaymentRequest,
  GetInfoResponse
} from '@breeztech/breez-sdk-liquid';

export interface BreezWalletState {
  isConnected: boolean;
  balance: number;
  pendingReceive: number;
  pendingSend: number;
  nodeInfo?: GetInfoResponse;
}

export class BreezService {
  private static instance: BreezService;
  private sdk: LiquidSdk | null = null;
  private eventListener: EventListener | null = null;
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

      console.log('Initializing Breez SDK...');
      
      // Convert mnemonic to seed
      const seed = await mnemonicToSeed(mnemonic);
      
      // Create config for testnet
      const config: Config = await defaultConfig(LiquidNetwork.TESTNET);
      
      // Set up event listener
      this.eventListener = {
        onEvent: (breezEvent: BreezEvent) => {
          console.log('Breez Event:', breezEvent);
          // Handle events like payment updates, sync progress, etc.
          this.handleBreezEvent(breezEvent);
        }
      };

      // Connect to Breez SDK
      this.sdk = await connect({
        config,
        seed: Array.from(seed),
        listener: this.eventListener
      });

      this.isInitialized = true;
      console.log('Breez SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Breez SDK:', error);
      throw new Error(`Breez SDK initialization failed: ${error}`);
    }
  }

  private handleBreezEvent(event: BreezEvent): void {
    switch (event.type) {
      case 'paymentSucceeded':
        console.log('Payment succeeded:', event.details);
        break;
      case 'paymentFailed':
        console.log('Payment failed:', event.details);
        break;
      case 'synced':
        console.log('Wallet synced');
        break;
      default:
        console.log('Unhandled Breez event:', event);
    }
  }

  async getWalletInfo(): Promise<BreezWalletState> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      const info = await this.sdk.getInfo();
      
      return {
        isConnected: true,
        balance: info.balanceSat,
        pendingReceive: info.pendingReceiveSat,
        pendingSend: info.pendingSendSat,
        nodeInfo: info
      };
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      throw error;
    }
  }

  async createInvoice(amountSats: number, description?: string): Promise<{ bolt11: string; paymentHash: string }> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      const prepareRequest: PrepareReceiveRequest = {
        paymentMethod: { type: 'lightning', invoiceAmountSat: amountSats }
      };

      const prepareResponse: PrepareReceiveResponse = await this.sdk.prepareReceivePayment(prepareRequest);
      
      const receiveRequest: ReceivePaymentRequest = {
        prepareResponse,
        description: description || 'Lightning payment'
      };

      const response = await this.sdk.receivePayment(receiveRequest);
      
      return {
        bolt11: response.destination,
        paymentHash: response.id
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  async payInvoice(bolt11: string): Promise<{ paymentHash: string; status: string }> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      const prepareRequest: PrepareSendRequest = {
        destination: bolt11
      };

      const prepareResponse: PrepareSendResponse = await this.sdk.prepareSendPayment(prepareRequest);
      
      const sendRequest: SendPaymentRequest = {
        prepareResponse
      };

      const response = await this.sdk.sendPayment(sendRequest);
      
      return {
        paymentHash: response.payment.id,
        status: 'complete'
      };
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw error;
    }
  }

  async sync(): Promise<void> {
    if (!this.sdk) {
      throw new Error('Breez SDK not initialized');
    }

    try {
      await this.sdk.sync();
    } catch (error) {
      console.error('Failed to sync:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sdk) {
      await this.sdk.disconnect();
      this.sdk = null;
      this.isInitialized = false;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.sdk !== null;
  }
}

export const breezService = BreezService.getInstance();
