import { FC } from 'react';
import { Bill } from '../types';

interface Props {
  bill: Bill;
}

const PaymentProgress: FC<Props> = ({ bill }) => {
  const progress = (bill.paidAmount / bill.totalAmount) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span>Payment Progress</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PaymentProgress; 