'use client';

import BillForm from '../../../components/BillForm';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

export default function CreateBill() {
  const router = useRouter();
  const { publicKey } = useWallet();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newBill = {
      name: formData.get('name') as string,
      totalAmount: parseFloat(formData.get('amount') as string),
      participantName: formData.get('participantName') as string,
      createdAt: Date.now()
    };

    // Get existing pending bills for this wallet
    const existingBills = JSON.parse(
      localStorage.getItem(`pendingBills_${publicKey?.toString() || 'none'}`) || '[]'
    );

    // Add new bill
    const updatedBills = [...existingBills, newBill];

    // Save with wallet-specific key
    localStorage.setItem(
      `pendingBills_${publicKey?.toString() || 'none'}`,
      JSON.stringify(updatedBills)
    );

    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Bill</h1>
      <BillForm onSubmit={handleSubmit} />
    </div>
  );
} 