// Mock LDK service - placeholder for future LDK integration

export interface MockLdkInvoice {
  id: string;
  bolt11: string;
  amount: number;
}

export interface MockLdkPayment {
  id: string;
  amount: number;
  status: string;
}

let mockInitialized = false;

export async function initLdkNode(mnemonic: string) {
  console.log('Mock LDK: Initializing with mnemonic...');
  mockInitialized = true;
  return { initialized: true };
}

export async function ldkCreateInvoice(amountSats: number, description = "Mock LDK Invoice"): Promise<MockLdkInvoice> {
  if (!mockInitialized) throw new Error("Mock LDK node not initialized");
  
  return {
    id: `mock_invoice_${Date.now()}`,
    bolt11: `lnbc${amountSats}u1pwrp5z5pp5mock_invoice_${Date.now()}`,
    amount: amountSats
  };
}

export async function ldkPayInvoice(bolt11: string): Promise<MockLdkPayment> {
  if (!mockInitialized) throw new Error("Mock LDK node not initialized");
  
  return {
    id: `mock_payment_${Date.now()}`,
    amount: 0,
    status: "complete"
  };
}

export async function ldkGetBalance(): Promise<number> {
  if (!mockInitialized) throw new Error("Mock LDK node not initialized");
  return 25000;
}
