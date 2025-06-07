
import React from 'react';

interface BalanceCardProps {
  title: string;
  amount: number;
  unit: string;
  fiatValue?: number;
  currency?: string;
  color: 'electric' | 'lime' | 'orange';
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  title, 
  amount, 
  unit, 
  fiatValue, 
  currency,
  color 
}) => {
  const colorClasses = {
    electric: 'bg-electric-blue',
    lime: 'bg-electric-lime',
    orange: 'bg-electric-orange'
  };

  return (
    <div className="brutal-card">
      <div className={`h-2 ${colorClasses[color]} -mt-6 -mx-6 mb-4`} />
      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          <p className="text-3xl font-mono font-black">
            {amount.toLocaleString()} {unit}
          </p>
          {fiatValue && currency && (
            <p className="text-lg text-gray-600 font-mono">
              ≈ ${fiatValue.toFixed(2)} {currency}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
