
import { Buffer } from 'buffer';

// Make Buffer available globally
(globalThis as any).Buffer = Buffer;

// Also set it on window for broader compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
