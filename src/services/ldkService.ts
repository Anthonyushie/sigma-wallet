
import { LdkNode, LdkNodeConfig } from "@lightningdevkit/ldk-node-web";

let ldkNode: LdkNode | null = null;

// A simple in-memory storage for demonstration. In production, use secure storage!
let ldkStorage: { seedHex?: string } = {};

export async function initLdkNode(mnemonic: string) {
  if (ldkNode) return ldkNode;

  // Derive the seed from the mnemonic (normally use BIP39/BIP32 to get a 32-byte hex seed)
  // For demo, use first 32 bytes of mnemonic's utf8 encoding.
  const encoder = new TextEncoder();
  let _seed = encoder.encode(mnemonic.padEnd(32, "X")).slice(0, 32);
  ldkStorage.seedHex = Buffer.from(_seed).toString("hex");

  // Basic config: Use testnet
  const config: LdkNodeConfig = {
    storagePath: "ldk_node_storage", // adjust as needed!
    network: "testnet",
    listeningAddress: "127.0.0.1:9735",
    seed: _seed,
  };

  ldkNode = await LdkNode.init(config);

  await ldkNode.start();
  return ldkNode;
}

// Basic method to create invoice
export async function ldkCreateInvoice(amountSats: number, description = "LDK Invoice") {
  if (!ldkNode) throw new Error("LDK node not initialized");
  const invoice = await ldkNode.createInvoice(amountSats, description, 3600);
  return invoice;
}

// Basic method to pay invoice
export async function ldkPayInvoice(bolt11: string) {
  if (!ldkNode) throw new Error("LDK node not initialized");
  const payment = await ldkNode.payInvoice(bolt11);
  return payment;
}

// Get balance - for demonstration, returns total satoshis available
export async function ldkGetBalance() {
  if (!ldkNode) throw new Error("LDK node not initialized");
  const balance = await ldkNode.channelBalance();
  return balance;
}
