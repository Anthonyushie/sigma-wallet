// Lightning protocol handler for PWA
export class LightningProtocolHandler {
  static register() {
    // Register protocol handler if supported
    if ('registerProtocolHandler' in navigator) {
      try {
        (navigator as any).registerProtocolHandler(
          'lightning',
          `${window.location.origin}/?lightning=%s`
        );
        console.log('Lightning protocol handler registered');
      } catch (error) {
        console.warn('Failed to register lightning protocol handler:', error);
      }
    }
  }

  static handleLightningUri(uri: string): { type: 'invoice' | 'address'; value: string; amount?: number } | null {
    try {
      // Handle lightning: URIs
      if (uri.startsWith('lightning:')) {
        const value = uri.replace('lightning:', '');
        
        // Check if it's a Lightning invoice (starts with ln)
        if (this.isLightningInvoice(value)) {
          const amount = this.extractAmountFromInvoice(value);
          return { type: 'invoice', value, amount };
        }
        
        // Otherwise treat as Lightning address
        return { type: 'address', value };
      }

      // Handle bitcoin: URIs with Lightning fallback
      if (uri.startsWith('bitcoin:')) {
        const url = new URL(uri);
        const lightning = url.searchParams.get('lightning');
        if (lightning && this.isLightningInvoice(lightning)) {
          const amount = this.extractAmountFromInvoice(lightning);
          return { type: 'invoice', value: lightning, amount };
        }
      }

      // Handle direct Lightning invoice
      if (this.isLightningInvoice(uri)) {
        const amount = this.extractAmountFromInvoice(uri);
        return { type: 'invoice', value: uri, amount };
      }

      return null;
    } catch (error) {
      console.error('Failed to parse Lightning URI:', error);
      return null;
    }
  }

  static async handleClipboard(): Promise<{ type: 'invoice' | 'address'; value: string; amount?: number } | null> {
    try {
      if ('clipboard' in navigator && 'readText' in navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        
        // Check for Lightning invoice
        if (this.isLightningInvoice(text)) {
          const amount = this.extractAmountFromInvoice(text);
          return { type: 'invoice', value: text, amount };
        }
        
        // Check for Lightning URI
        if (text.startsWith('lightning:')) {
          return this.handleLightningUri(text);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      return null;
    }
  }

  static isLightningInvoice(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    return (
      (lowerText.startsWith('lnbc') || 
       lowerText.startsWith('lntb') || 
       lowerText.startsWith('lnbcrt')) && 
      text.length > 20
    );
  }

  static isLightningUri(text: string): boolean {
    return text.startsWith('lightning:');
  }

  static extractAmountFromInvoice(invoice: string): number | undefined {
    try {
      // Simple regex to extract amount from BOLT11 invoice
      // Format: ln{bc|tb|bcrt}[amount][multiplier]1[data]
      const match = invoice.toLowerCase().match(/^ln(bc|tb|bcrt)(\d+)([munp])?/);
      if (match) {
        const amount = parseInt(match[2]);
        const multiplier = match[3];
        
        // Convert to satoshis based on multiplier
        switch (multiplier) {
          case 'm': return amount * 100000; // millisats to sats
          case 'u': return amount * 100; // microsats to sats  
          case 'n': return amount / 10; // nanosats to sats
          case 'p': return amount / 10000; // picosats to sats
          default: return amount * 100000000; // whole bitcoin to sats
        }
      }
    } catch (error) {
      console.error('Failed to extract amount from invoice:', error);
    }
    return undefined;
  }

  static formatLightningUri(invoice: string): string {
    return `lightning:${invoice}`;
  }
}
