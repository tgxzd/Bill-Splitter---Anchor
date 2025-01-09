import { FC } from 'react';
import { LAMPORTS_PER_SOL } from '../utils/constants';

interface BillCardProps {
  name: string;
  amount: number;
  participantName: string;
  date: Date;
}

const BillCard: FC<BillCardProps> = ({ name, amount, participantName, date }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <div className="space-y-2">
        <p className="text-gray-600">
          Amount: <span className="font-medium">{amount / LAMPORTS_PER_SOL} SOL</span>
        </p>
        <p className="text-gray-600">
          Participant: <span className="font-medium">{participantName}</span>
        </p>
        <p className="text-gray-500 text-sm">
          Created: {date.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default BillCard; 