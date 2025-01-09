'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WalletConnect from '../components/WalletConnect';
import BillCard from '../components/BillCard';
import { useBillContract } from '../hooks/useBillContract';

export default function Home() {
  const { getBills } = useBillContract();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBills = async () => {
      try {
        const billsData = await getBills();
        setBills(billsData);
      } catch (error) {
        console.error('Error loading bills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, [getBills]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bill Split</h1>
        <WalletConnect />
      </div>
      
      <div className="flex justify-end mb-6">
        <Link
          href="/bills/create"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block"
        >
          Create New Bill
        </Link>
      </div>

      {loading ? (
        <div className="text-center">Loading bills...</div>
      ) : bills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => (
            <BillCard
              key={bill.address}
              name={bill.name}
              amount={bill.totalAmount}
              participantName={bill.participantName}
              date={new Date(bill.createdAt)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No bills found. Create your first bill!
        </div>
      )}
    </main>
  );
} 