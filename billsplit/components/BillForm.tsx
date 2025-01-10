'use client';

import { FC } from 'react';

interface BillFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const BillForm: FC<BillFormProps> = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Bill Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="
              mt-1 block w-full px-4 py-3
              bg-[#1A1F2E] border border-gray-700
              rounded-lg focus:ring-blue-500 focus:border-blue-500
              text-white placeholder-gray-400
            "
            placeholder="Enter bill name"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
            Amount (SOL)
          </label>
          <input
            type="number"
            name="amount"
            id="amount"
            required
            step="0.000000001"
            min="0"
            className="
              mt-1 block w-full px-4 py-3
              bg-[#1A1F2E] border border-gray-700
              rounded-lg focus:ring-blue-500 focus:border-blue-500
              text-white placeholder-gray-400
            "
            placeholder="Enter amount in SOL"
          />
        </div>

        <div>
          <label htmlFor="participantName" className="block text-sm font-medium text-gray-300">
            Participant Name
          </label>
          <input
            type="text"
            name="participantName"
            id="participantName"
            required
            className="
              mt-1 block w-full px-4 py-3
              bg-[#1A1F2E] border border-gray-700
              rounded-lg focus:ring-blue-500 focus:border-blue-500
              text-white placeholder-gray-400
            "
            placeholder="Enter participant name"
          />
        </div>

        <button
          type="submit"
          className="
            w-full px-6 py-3 rounded-lg
            bg-gradient-to-r from-blue-600 to-purple-600
            hover:from-blue-700 hover:to-purple-700
            text-white font-medium
            transition-all duration-200 transform hover:scale-105
          "
        >
          Create Bill
        </button>
      </div>
    </form>
  );
};

export default BillForm; 