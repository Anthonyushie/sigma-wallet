
# SIGMA STACK ⚡

A modern Lightning wallet built with React, TypeScript, and the Breez SDK. SIGMA STACK provides a brutalist UI experience for managing Bitcoin Lightning payments with your keys, your coins philosophy.

## 🚀 Features

- **Self-Custody Lightning Wallet**: Full control over your Bitcoin with 12-word seed phrase backup
- **Lightning Payments**: Send and receive Lightning Network payments instantly
- **Invoice Management**: Generate QR codes for receiving payments and decode Lightning invoices
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **PWA Support**: Install as a Progressive Web App for native-like experience
- **Real-time Balance**: Live Lightning balance updates and transaction history
- **Brutalist UI**: Bold, unapologetic design that puts functionality first

## ⚡ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom brutalist design system
- **Lightning**: Breez SDK Liquid for Lightning Network functionality
- **Bitcoin**: bitcoinjs-lib for Bitcoin operations and BIP39 for mnemonic generation
- **UI Components**: Shadcn/ui with Radix UI primitives
- **State Management**: React Context API with custom hooks
- **Routing**: React Router DOM
- **QR Codes**: qrcode.react for payment QR generation
- **Data Fetching**: TanStack Query for server state management

## 🛠 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📱 Usage

### First Time Setup

1. **Create New Wallet**: Generate a fresh 12-word seed phrase
2. **Backup Seed**: Securely store your 12-word recovery phrase
3. **Restore Wallet**: Import existing wallet using seed phrase

### Sending Payments

1. Navigate to Send page
2. Paste Lightning invoice
3. Review payment details
4. Confirm transaction

### Receiving Payments

1. Go to Receive page
2. Enter amount in satoshis
3. Generate QR code
4. Share with sender

## 🔧 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── services/           # External service integrations
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Key Components

- **WalletContext**: Central state management for wallet operations
- **LightningWallet Hook**: Lightning Network payment handling
- **Invoice Decoder**: Parse and validate Lightning invoices
- **Bitcoin Wallet Service**: Core Bitcoin operations and key management

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## 🔐 Security Features

- **Client-side Key Generation**: All private keys generated locally
- **Secure Storage**: Encrypted storage using browser APIs
- **No Server Dependencies**: Fully client-side application
- **Seed Phrase Backup**: Standard BIP39 12-word recovery phrases
- **Lightning Network Security**: Built on Breez SDK security model

## 🌐 Deployment

### Lovable Platform

1. Click the "Publish" button in Lovable editor
2. Your app will be deployed to `yourapp.lovable.app`

### Custom Domain

1. Navigate to Project > Settings > Domains in Lovable
2. Connect your custom domain
3. Follow DNS configuration instructions

### Self-Hosting

The app can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always backup your seed phrase securely. The developers are not responsible for any loss of funds.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Join the community discussions
- Check the documentation

---

**Remember: Your keys, your coins. Everything else is mid.** 🔥
