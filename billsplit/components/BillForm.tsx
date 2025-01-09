'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '../utils/constants';
import { useBillContract } from '../hooks/useBillContract';
import { useRouter } from 'next/navigation';

export default function BillForm() {
  const { publicKey } = useWallet();
  const { createBill } = useBillContract();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    participantName: '', // Single participant name
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!publicKey) throw new Error('Please connect your wallet first');

      // Validate inputs
      if (!formData.name.trim()) throw new Error('Bill name is required');
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!formData.participantName.trim()) {
        throw new Error('Participant name is required');
      }

      // Convert amount to lamports
      const amountLamports = parseFloat(formData.amount) * LAMPORTS_PER_SOL;

      // Create the bill with creator as the only participant
      const signature = await createBill(
        formData.name,
        amountLamports,
        [publicKey.toString()], // Creator's wallet
        [amountLamports], // Full amount
        formData.participantName
      );

      console.log('Bill created successfully:', signature);
      router.push('/'); // Redirect to homepage
    } catch (err) {
      console.error('Error creating bill:', err);
      setError(err instanceof Error ? err.message : 'Failed to create bill');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Bill Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Amount (SOL)</label>
        <input
          type="number"
          step="0.000000001"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Participant Name</label>
        <input
          type="text"
          value={formData.participantName}
          onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
        disabled={!publicKey || isLoading}
      >
        {isLoading ? 'Creating Bill...' : 'Create Bill'}
      </button>
    </form>
  );
} 