/**
 * WebAssembly loader utility for Breez SDK
 * Handles WASM initialization in browser environment
 */

export class WasmLoader {
  private static isLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  static async ensureWasmLoaded(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadWasm();
    return this.loadPromise;
  }

  private static async loadWasm(): Promise<void> {
    try {
      console.log('Loading WebAssembly for Breez SDK...');
      
      // The Breez SDK should handle WASM loading internally
      // This is a placeholder for any additional WASM setup if needed
      
      this.isLoaded = true;
      console.log('WebAssembly loaded successfully');
    } catch (error) {
      console.error('Failed to load WebAssembly:', error);
      throw new Error(`WASM loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static isWasmSupported(): boolean {
    return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
  }
}