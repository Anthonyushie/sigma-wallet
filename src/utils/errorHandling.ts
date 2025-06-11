/**
 * Error handling utilities for Breez SDK operations
 */

export enum BreezErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVOICE_CREATION_FAILED = 'INVOICE_CREATION_FAILED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_INVOICE = 'INVALID_INVOICE',
  WALLET_NOT_INITIALIZED = 'WALLET_NOT_INITIALIZED',
  SYNC_FAILED = 'SYNC_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface BreezError {
  type: BreezErrorType;
  message: string;
  originalError?: Error;
  userMessage: string;
}

export class BreezErrorHandler {
  static handleError(error: unknown): BreezError {
    console.error('Breez SDK Error:', error);

    if (error instanceof Error) {
      return this.categorizeError(error);
    }

    return {
      type: BreezErrorType.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      originalError: error instanceof Error ? error : new Error(String(error))
    };
  }

  private static categorizeError(error: Error): BreezError {
    const message = error.message.toLowerCase();

    if (message.includes('connection') || message.includes('network')) {
      return {
        type: BreezErrorType.NETWORK_ERROR,
        message: error.message,
        originalError: error,
        userMessage: 'Network connection failed. Please check your internet connection and try again.'
      };
    }

    if (message.includes('insufficient') || message.includes('balance')) {
      return {
        type: BreezErrorType.INSUFFICIENT_BALANCE,
        message: error.message,
        originalError: error,
        userMessage: 'Insufficient balance to complete this transaction.'
      };
    }

    if (message.includes('invoice') && message.includes('invalid')) {
      return {
        type: BreezErrorType.INVALID_INVOICE,
        message: error.message,
        originalError: error,
        userMessage: 'Invalid Lightning invoice. Please check the invoice and try again.'
      };
    }

    if (message.includes('payment') && message.includes('failed')) {
      return {
        type: BreezErrorType.PAYMENT_FAILED,
        message: error.message,
        originalError: error,
        userMessage: 'Payment failed. Please try again or contact support.'
      };
    }

    if (message.includes('not connected') || message.includes('not initialized')) {
      return {
        type: BreezErrorType.WALLET_NOT_INITIALIZED,
        message: error.message,
        originalError: error,
        userMessage: 'Wallet not initialized. Please restart the app.'
      };
    }

    if (message.includes('sync')) {
      return {
        type: BreezErrorType.SYNC_FAILED,
        message: error.message,
        originalError: error,
        userMessage: 'Failed to sync wallet data. Please try again.'
      };
    }

    return {
      type: BreezErrorType.UNKNOWN_ERROR,
      message: error.message,
      originalError: error,
      userMessage: 'An unexpected error occurred. Please try again.'
    };
  }

  static getRetryableErrors(): BreezErrorType[] {
    return [
      BreezErrorType.NETWORK_ERROR,
      BreezErrorType.SYNC_FAILED,
      BreezErrorType.CONNECTION_FAILED
    ];
  }

  static isRetryable(errorType: BreezErrorType): boolean {
    return this.getRetryableErrors().includes(errorType);
  }
}