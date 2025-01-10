import { FC } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import useProgress from '../hooks/useProgress';

const ProgressTracker: FC = () => {
  const { progress } = useProgress();

  const calculateProgress = (value: number, max: number): number => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <div className="bg-[#1A1F2E] rounded-xl p-6 border border-blue-500/30">
      <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
      
      {/* Progress Bars */}
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Total Bills Paid</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{progress.totalBillsPaid}</span>
              <span className="text-sm text-gray-500">/ 10 for next achievement</span>
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${calculateProgress(progress.totalBillsPaid, 10)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Total SOL Paid</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">
                {(progress.totalAmountPaid / LAMPORTS_PER_SOL).toFixed(2)} SOL
              </span>
              <span className="text-sm text-gray-500">/ 50 SOL for next achievement</span>
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${calculateProgress(progress.totalAmountPaid / LAMPORTS_PER_SOL, 50)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Achievements</h3>
          <span className="text-sm text-gray-400">
            {progress.achievements.filter(a => a.isUnlocked).length} / {progress.achievements.length} Unlocked
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`
                p-4 rounded-lg border transition-all duration-300
                ${achievement.isUnlocked 
                  ? 'bg-blue-500/10 border-blue-500/30 transform hover:scale-105' 
                  : 'bg-gray-800/50 border-gray-700 opacity-50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Last updated: {new Date(progress.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export default ProgressTracker; 