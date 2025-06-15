
import { bech32 } from 'bech32';

export interface InvoiceDetails {
  amount: number; // amount in satoshis
  description: string;
  paymentHash: string;
  expiry: number;
  timestamp: number;
}

export const decodeInvoice = (invoice: string): InvoiceDetails => {
  try {
    // Remove lightning: prefix if present
    const cleanInvoice = invoice.replace(/^lightning:/, '');
    
    // Basic validation
    if (!cleanInvoice.toLowerCase().startsWith('ln')) {
      throw new Error('Invalid Lightning invoice format');
    }

    // Decode bech32
    const decoded = bech32.decode(cleanInvoice, 2000);
    const hrp = decoded.prefix;
    const data = decoded.words;

    // Extract network and amount from HRP
    let network = 'mainnet';
    let amountStr = '';
    
    if (hrp.startsWith('lnbc')) {
      network = 'mainnet';
      amountStr = hrp.substring(4);
    } else if (hrp.startsWith('lntb')) {
      network = 'testnet';
      amountStr = hrp.substring(4);
    } else if (hrp.startsWith('lnbcrt')) {
      network = 'regtest';
      amountStr = hrp.substring(6);
    }

    // Parse amount
    let amount = 0;
    if (amountStr) {
      const multiplier = amountStr.slice(-1);
      const value = parseFloat(amountStr.slice(0, -1));
      
      switch (multiplier) {
        case 'm': // milli-bitcoin (0.001 BTC)
          amount = Math.floor(value * 100000); // convert to sats
          break;
        case 'u': // micro-bitcoin (0.000001 BTC)
          amount = Math.floor(value * 100); // convert to sats
          break;
        case 'n': // nano-bitcoin (0.000000001 BTC)
          amount = Math.floor(value * 0.1); // convert to sats
          break;
        case 'p': // pico-bitcoin (0.000000000001 BTC)
          amount = Math.floor(value * 0.0001); // convert to sats
          break;
        default:
          // If no multiplier, assume it's in millisatoshis
          amount = Math.floor(value / 1000);
      }
    }

    // Extract basic information (simplified parsing)
    // In a full implementation, you'd parse all the tagged fields
    return {
      amount,
      description: 'Lightning payment',
      paymentHash: Math.random().toString(36).substring(2, 15), // Mock hash
      expiry: 3600, // 1 hour default
      timestamp: Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Failed to decode invoice:', error);
    throw new Error('Invalid Lightning invoice');
  }
};
