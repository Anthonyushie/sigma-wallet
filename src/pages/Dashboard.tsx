
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import Layout from '../components/Layout';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import ActionButton from '../components/ActionButton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWallet();

  return (
    <Layout title="SIGMA WALLET">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Balance Cards */}
        <div className="space-y-4">
          <BalanceCard
            title="BITCOIN BALANCE"
            amount={wallet.balance.bitcoin}
            unit="BTC"
            fiatValue={wallet.balance.fiat}
            currency={wallet.balance.currency}
            color="electric"
          />
          
          <BalanceCard
            title="LIGHTNING BALANCE"
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
            SEND
          </ActionButton>
          
          <ActionButton
            onClick={() => navigate('/receive')}
            variant="success"
            size="lg"
            className="w-full"
          >
            RECEIVE
          </ActionButton>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase">RECENT TRANSACTIONS</h2>
          <div className="space-y-3">
            {wallet.transactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
