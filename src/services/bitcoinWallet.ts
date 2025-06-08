
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { get, set, del } from 'idb-keyval';

export interface WalletKeys {
  mnemonic: string;
  privateKey: string;
  publicKey: string;
  address: string;
}

export class BitcoinWalletService {
  private static readonly MNEMONIC_KEY = 'wallet_mnemonic';

  static async generateWallet(): Promise<WalletKeys> {
    const mnemonic = bip39.generateMnemonic();
    return this.restoreWallet(mnemonic);
  }

  static async restoreWallet(mnemonic: string): Promise<WalletKeys> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(Buffer.from(seed));
    
    // Derive the first account's first receiving address (m/44'/0'/0'/0/0)
    const path = "m/44'/0'/0'/0/0";
    const child = root.derivePath(path);
    
    if (!child.privateKey) {
      throw new Error('Failed to derive private key');
    }

    const { address } = bitcoin.payments.p2wpkh({ 
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin 
    });

    if (!address) {
      throw new Error('Failed to generate address');
    }

    const walletKeys: WalletKeys = {
      mnemonic,
      privateKey: child.privateKey.toString('hex'),
      publicKey: child.publicKey.toString('hex'),
      address
    };

    // Store mnemonic securely
    await set(this.MNEMONIC_KEY, mnemonic);

    return walletKeys;
  }

  static async getStoredMnemonic(): Promise<string | null> {
    return await get(this.MNEMONIC_KEY);
  }

  static async hasWallet(): Promise<boolean> {
    const mnemonic = await this.getStoredMnemonic();
    return mnemonic !== undefined && mnemonic !== null;
  }

  static async deleteWallet(): Promise<void> {
    await del(this.MNEMONIC_KEY);
  }

  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }
}
