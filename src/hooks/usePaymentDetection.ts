
import { useState, useEffect, useCallback } from 'react';
import { breezService } from '../services/breez';

export interface PaymentDetectionState {
  isListening: boolean;
  detectedPayment: {
    amount: number;
    paymentHash: string;
  } | null;
  error: string | null;
}

export const usePaymentDetection = () => {
  const [state, setState] = useState<PaymentDetectionState>({
    isListening: false,
    detectedPayment: null,
    error: null,
  });

  const startListening = useCallback((expectedAmount: number, paymentHash: string) => {
    setState(prev => ({
      ...prev,
      isListening: true,
      detectedPayment: null,
      error: null,
    }));

    let previousBalance: number | null = null;

    // Poll for payment status every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        if (!breezService.isReady()) {
          console.log('Breez SDK not ready, continuing to poll...');
          return;
        }

        // Sync wallet to get latest payment info
        await breezService.sync();
        
        // Get wallet info to check if balance has increased
        const walletInfo = await breezService.getWalletInfo();
        console.log('Checking for payment, current balance:', walletInfo.balance);

        // Initialize previous balance on first check
        if (previousBalance === null) {
          previousBalance = walletInfo.balance;
          return;
        }

        // Check if balance increased by the expected amount (or more)
        const balanceIncrease = walletInfo.balance - previousBalance;
        if (balanceIncrease >= expectedAmount) {
          console.log('Payment detected! Balance increased by:', balanceIncrease);
          setState(prev => ({
            ...prev,
            isListening: false,
            detectedPayment: {
              amount: balanceIncrease, // Use actual increase, not expected
              paymentHash,
            },
          }));
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }, 2000);

    // Stop listening after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      setState(prev => ({
        ...prev,
        isListening: false,
        error: 'Payment detection timeout',
      }));
    }, 300000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, []);

  const stopListening = useCallback(() => {
    setState(prev => ({
      ...prev,
      isListening: false,
    }));
  }, []);

  const resetDetection = useCallback(() => {
    setState({
      isListening: false,
      detectedPayment: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetDetection,
  };
};
