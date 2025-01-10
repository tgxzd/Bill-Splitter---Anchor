import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Achievement, UserProgress, Bill } from '../types';
import { useBillContract } from './useBillContract';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_bill',
    title: 'First Bill Paid',
    description: 'Successfully paid your first bill',
    icon: '🎉',
    requirement: 1,
    isUnlocked: false
  },
  {
    id: 'ten_bills',
    title: '10 Bills Completed',
    description: 'Successfully paid 10 bills',
    icon: '🏆',
    requirement: 10,
    isUnlocked: false
  },
  {
    id: 'fifty_sol',
    title: 'Big Spender',
    description: 'Paid more than 50 SOL in bills',
    icon: '💰',
    requirement: 50,
    isUnlocked: false
  }
];

export const useProgress = () => {
  const { publicKey } = useWallet();
  const { getBills } = useBillContract();
  const [progress, setProgress] = useState<UserProgress>({
    totalBillsPaid: 0,
    totalAmountPaid: 0,
    achievements: INITIAL_ACHIEVEMENTS,
    lastUpdated: Date.now()
  });

  // Load and calculate real progress from blockchain
  useEffect(() => {
    const loadRealProgress = async () => {
      if (!publicKey) return;

      try {
        // Get all bills from blockchain
        const bills = await getBills() as Bill[];
        
        // Calculate real totals
        const totalBillsPaid = bills.length;
        const totalAmountPaid = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

        // Check if we have saved achievements
        const savedProgress = localStorage.getItem(`progress_${publicKey.toString()}`);
        const savedAchievements = savedProgress 
          ? JSON.parse(savedProgress).achievements 
          : INITIAL_ACHIEVEMENTS;

        // Update achievements based on real totals
        const updatedAchievements = savedAchievements.map(achievement => {
          let isUnlocked = achievement.isUnlocked;

          switch (achievement.id) {
            case 'first_bill':
              isUnlocked = totalBillsPaid >= 1;
              break;
            case 'ten_bills':
              isUnlocked = totalBillsPaid >= 10;
              break;
            case 'fifty_sol':
              isUnlocked = totalAmountPaid / LAMPORTS_PER_SOL >= 50;
              break;
          }

          return {
            ...achievement,
            isUnlocked
          };
        });

        // Set the real progress
        setProgress({
          totalBillsPaid,
          totalAmountPaid,
          achievements: updatedAchievements,
          lastUpdated: Date.now()
        });

        // Save to localStorage
        localStorage.setItem(
          `progress_${publicKey.toString()}`,
          JSON.stringify({
            totalBillsPaid,
            totalAmountPaid,
            achievements: updatedAchievements,
            lastUpdated: Date.now()
          })
        );
      } catch (error) {
        console.error('Error loading real progress:', error);
      }
    };

    loadRealProgress();
  }, [publicKey, getBills]);

  const updateProgress = (billAmount: number) => {
    if (!publicKey) return;

    setProgress(prev => {
      const newTotalBillsPaid = prev.totalBillsPaid + 1;
      const newTotalAmountPaid = prev.totalAmountPaid + billAmount;
      
      // Check and update achievements
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.isUnlocked) return achievement;

        let isNowUnlocked = false;
        switch (achievement.id) {
          case 'first_bill':
            isNowUnlocked = newTotalBillsPaid >= 1;
            break;
          case 'ten_bills':
            isNowUnlocked = newTotalBillsPaid >= 10;
            break;
          case 'fifty_sol':
            isNowUnlocked = newTotalAmountPaid / LAMPORTS_PER_SOL >= 50;
            break;
        }

        if (isNowUnlocked && !achievement.isUnlocked) {
          // Show achievement notification
          showAchievementNotification(achievement);
        }

        return {
          ...achievement,
          isUnlocked: achievement.isUnlocked || isNowUnlocked
        };
      });

      const newProgress = {
        totalBillsPaid: newTotalBillsPaid,
        totalAmountPaid: newTotalAmountPaid,
        achievements: updatedAchievements,
        lastUpdated: Date.now()
      };

      // Save to localStorage
      localStorage.setItem(
        `progress_${publicKey.toString()}`,
        JSON.stringify(newProgress)
      );

      return newProgress;
    });
  };

  const showAchievementNotification = (achievement: Achievement) => {
    // Create and show a toast notification
    const notification = document.createElement('div');
    notification.className = `
      fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg
      shadow-lg transform transition-all duration-500 flex items-center space-x-3
      z-50
    `;
    notification.innerHTML = `
      <span class="text-2xl">${achievement.icon}</span>
      <div>
        <h4 class="font-bold">${achievement.title}</h4>
        <p class="text-sm opacity-90">${achievement.description}</p>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  };

  return {
    progress,
    updateProgress
  };
};

export default useProgress; 