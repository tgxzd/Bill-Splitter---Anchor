'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import WalletConnect from '../components/WalletConnect';
import BillCard from '../components/BillCard';
import { useBillContract } from '../hooks/useBillContract';
import { Bill } from '../types';
import { PROGRAM_ID } from '../utils/constants';
import ProgressTracker from '../components/ProgressTracker';
import useProgress from '../hooks/useProgress';

interface PendingBill {
  name: string;
  totalAmount: number;
  participantName: string;
  createdAt: number;
}

export default function Home() {
  const { getBills, createBill, payBill } = useBillContract();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [bills, setBills] = useState<Bill[]>([]);
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { updateProgress } = useProgress();

  useEffect(() => {
    const loadBills = async () => {
      try {
        // Load blockchain bills
        if (publicKey) {
          const billsData = await getBills();
          setBills(billsData as Bill[]);
        }

        // Load pending bills from localStorage with wallet-specific key
        const storedPendingBills = JSON.parse(
          localStorage.getItem(`pendingBills_${publicKey?.toString() || 'none'}`) || '[]'
        );
        setPendingBills(storedPendingBills);
      } catch (error) {
        console.error('Error loading bills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBills();
    
    // Clear pending bills when wallet disconnects
    if (!publicKey) {
      setPendingBills([]);
    }
  }, [getBills, publicKey]);

  const handlePayBill = async (bill: PendingBill) => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setProcessingPayment(true);
    try {
      // First create the bill on the blockchain
      console.log('Creating bill:', bill);
      const lamports = Math.floor(bill.totalAmount * LAMPORTS_PER_SOL);
      
      const billPDA = await createBill(
        bill.name,
        lamports,
        [publicKey.toString()],
        [lamports],
        bill.participantName
      );

      console.log('Bill created on blockchain, PDA:', billPDA.toString());

      // Pay the bill
      const payTx = await payBill(billPDA, lamports);
      console.log('Bill paid:', payTx);

      // Update progress and achievements
      updateProgress(lamports);

      // Remove the paid bill from pending bills
      const updatedPendingBills = pendingBills.filter(
        (b) => b.name !== bill.name || b.createdAt !== bill.createdAt
      );
      // Save with wallet-specific key
      localStorage.setItem(
        `pendingBills_${publicKey.toString()}`,
        JSON.stringify(updatedPendingBills)
      );
      setPendingBills(updatedPendingBills);

      // Refresh blockchain bills
      const billsData = await getBills();
      setBills(billsData as Bill[]);

      alert('Bill paid successfully!');
    } catch (error: any) {
      console.error('Error paying bill:', error);
      let errorMessage = 'Failed to pay bill. ';
      
      if (error.message) {
        if (error.message.includes('Insufficient funds')) {
          errorMessage += 'You do not have enough SOL in your wallet.';
        } else if (error.message.includes('User rejected')) {
          errorMessage += 'Transaction was rejected.';
        } else {
          errorMessage += error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A1017] to-[#111827] text-white">
      {/* Header */}
      <div className="bg-[#1A1F2E]/50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                SolSplit
              </h1>
              <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">By Galah Panjang</span>
            </div>
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl text-gray-400">
              {publicKey ? 'Your Bills' : 'Connect wallet to manage bills'}
            </h2>
          </div>
          <Link
            href="/bills/create"
            className="
              bg-gradient-to-r from-blue-600 to-purple-600
              hover:from-blue-700 hover:to-purple-700
              text-white px-6 py-3 rounded-lg
              transition-all duration-200 transform hover:scale-105
              flex items-center space-x-2
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Create New Bill</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Progress Tracker */}
            {publicKey && <ProgressTracker />}

            {/* Pending Bills Section */}
            {pendingBills.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <h2 className="text-2xl font-bold">Pending Bills</h2>
                  <span className="bg-yellow-500/20 text-yellow-400 text-sm px-2 py-1 rounded-full">
                    {pendingBills.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingBills.map((bill, index) => (
                    <div key={`${bill.name}-${bill.createdAt}`} className="relative group">
                      <BillCard
                        name={bill.name}
                        amount={bill.totalAmount}
                        participantName={bill.participantName}
                        date={new Date(bill.createdAt)}
                        isPending={true}
                      />
                      <button
                        onClick={() => handlePayBill(bill)}
                        disabled={processingPayment || !publicKey}
                        className={`
                          absolute top-3 right-16 
                          px-4 py-1.5 rounded-full text-sm font-medium
                          transition-all duration-200
                          ${!publicKey 
                            ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                            : processingPayment
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }
                        `}
                      >
                        {!publicKey 
                          ? 'Connect Wallet'
                          : processingPayment 
                          ? 'Processing...' 
                          : 'Pay Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Paid Bills Section */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <h2 className="text-2xl font-bold">Paid Bills</h2>
                {bills.length > 0 && (
                  <span className="bg-blue-500/20 text-blue-400 text-sm px-2 py-1 rounded-full">
                    {bills.length}
                  </span>
                )}
              </div>
              {bills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bills
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((bill) => (
                    <BillCard
                      key={bill.address}
                      name={bill.name}
                      amount={bill.totalAmount / 1e9}
                      participantName={bill.participantName}
                      date={new Date(bill.createdAt * 1000)}
                      isPending={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#1A1F2E]/50 rounded-xl p-12 text-center border border-gray-800">
                  <div className="text-gray-400 text-lg mb-2">
                    {publicKey ? 'No paid bills found.' : 'Connect your wallet to view paid bills.'}
                  </div>
                  {!publicKey && (
                    <div className="text-gray-500 text-sm">
                      Use the wallet button in the top right to connect
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
} 