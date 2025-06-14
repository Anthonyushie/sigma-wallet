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

  static handleLightningUri(uri: string): { type: 'invoice' | 'address'; value: string } | null {
    try {
      // Handle lightning: URIs
      if (uri.startsWith('lightning:')) {
        const value = uri.replace('lightning:', '');
        
        // Check if it's a Lightning invoice (starts with ln)
        if (value.toLowerCase().startsWith('ln')) {
          return { type: 'invoice', value };
        }
        
        // Otherwise treat as Lightning address
        return { type: 'address', value };
      }

      // Handle bitcoin: URIs with Lightning fallback
      if (uri.startsWith('bitcoin:')) {
        const url = new URL(uri);
        const lightning = url.searchParams.get('lightning');
        if (lightning) {
          return { type: 'invoice', value: lightning };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to parse Lightning URI:', error);
      return null;
    }
  }

  static async handleClipboard(): Promise<string | null> {
    try {
      if ('clipboard' in navigator && 'readText' in navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        
        // Check for Lightning invoice
        if (text.toLowerCase().startsWith('ln')) {
          return text;
        }
        
        // Check for Lightning URI
        if (text.startsWith('lightning:')) {
          return text;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      return null;
    }
  }

  static isLightningInvoice(text: string): boolean {
    return text.toLowerCase().startsWith('ln') && text.length > 10;
  }

  static isLightningUri(text: string): boolean {
    return text.startsWith('lightning:');
  }
}
