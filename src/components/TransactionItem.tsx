
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Transaction } from '../types/wallet';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isReceive = transaction.type === 'receive';
  const statusColors = {
    completed: 'bg-electric-lime',
    pending: 'bg-electric-orange',
    failed: 'bg-red-500'
  };

  return (
    <div className="brutal-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-2 ${isReceive ? 'bg-electric-lime' : 'bg-electric-blue'} border-2 border-black`}>
            {isReceive ? (
              <ArrowDown size={20} className="text-black" />
            ) : (
              <ArrowUp size={20} className="text-black" />
            )}
          </div>
          <div>
            <p className="font-black uppercase text-sm">
              {isReceive ? 'RECEIVED' : 'SENT'}
            </p>
            <p className="text-sm text-gray-600 font-mono">
              {transaction.timestamp.toLocaleDateString()}
            </p>
            {transaction.description && (
              <p className="text-xs text-gray-500">
                {transaction.description}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono font-black ${isReceive ? 'text-green-600' : 'text-red-600'}`}>
            {isReceive ? '+' : '-'}{transaction.amount.toLocaleString()} {transaction.currency}
          </p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${statusColors[transaction.status]}`} />
            <span className="text-xs font-black uppercase">
              {transaction.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
