
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import Layout from '../components/Layout';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import ActionButton from '../components/ActionButton';
import LightningStatus from '../components/LightningStatus';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWallet();

  return (
    <Layout title="SIGMA STACK">
      <div className="max-w-md mx-auto space-y-6">

        {/* Settings Button */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/settings')}
            className="brutal-button p-3 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Lightning Status */}
        <LightningStatus />

        {/* Balance Cards */}
        <div className="space-y-4">
          <BalanceCard
            title="BITCOIN STASH"
            amount={wallet.balance.bitcoin}
            unit="BTC"
            fiatValue={wallet.balance.fiat}
            currency={wallet.balance.currency}
            color="electric"
          />
          <BalanceCard
            title="LIGHTNING STACK"
            amount={wallet.balance.lightning}
            unit="SATS"
            color="lime"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            onClick={() => navigate('/send')}
            variant="primary"
            size="lg"
            className="w-full"
          >
            YEET SOME COIN
          </ActionButton>
          <ActionButton
            onClick={() => navigate('/receive')}
            variant="success"
            size="lg"
            className="w-full"
          >
            SECURE THE BAG
          </ActionButton>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase">YOUR LATEST MOVES</h2>
          <div className="space-y-3">
            {wallet.transactions.length === 0 ? (
              <div className="font-mono text-gray-500 text-center p-4 bg-gray-100 rounded-lg">
                No plays yet.<br />Go make some moves! 🤑
              </div>
            ) : (
              wallet.transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
