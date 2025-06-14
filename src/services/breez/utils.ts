
import * as bip39 from 'bip39';

export const mnemonicToSeed = (mnemonic: string): Uint8Array => {
  try {
    const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
    return new Uint8Array(seedBuffer.slice(0, 32));
  } catch (error) {
    throw new Error('Failed to convert mnemonic to seed');
  }
};

export const isValidLightningInvoice = (invoice: string): boolean => {
  const lowerInvoice = invoice.toLowerCase();
  return (
    lowerInvoice.startsWith('lnbc') ||
    lowerInvoice.startsWith('lntb') ||
    lowerInvoice.startsWith('lnbcrt')
  ) && invoice.length > 20;
};
