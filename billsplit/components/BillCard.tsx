import { FC } from 'react';
import { LAMPORTS_PER_SOL } from '../utils/constants';

interface BillCardProps {
  name: string;
  amount: number;
  participantName: string;
  date: Date;
  isPending?: boolean;
}

const BillCard: FC<BillCardProps> = ({ name, amount, participantName, date, isPending = false }) => {
  const displayName = name.split('-').slice(0, -1).join('-') || name;

  return (
    <div className={`
      relative overflow-hidden
      bg-[#1A1F2E] rounded-xl shadow-lg
      transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
      ${isPending ? 'border border-yellow-500/30' : 'border border-blue-500/30'}
    `}>
      {/* Status Badge */}
      {isPending && (
        <div className="absolute top-3 right-3">
          <span className="bg-yellow-500/20 text-yellow-400 text-xs font-medium px-2.5 py-1 rounded-full border border-yellow-500/20">
            Pending
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">{displayName}</h3>
        
        <div className="space-y-4">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="text-2xl font-bold text-white">{amount} SOL</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700"></div>

          {/* Participant */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Participant</span>
            <span className="text-white font-medium">{participantName}</span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Created</span>
            <span className="text-gray-300 text-sm">
              {date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillCard; 