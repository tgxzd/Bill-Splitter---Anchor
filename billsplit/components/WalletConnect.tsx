'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../src/components/solana/solana-provider';

const WalletConnect: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="flex items-center space-x-4">
      <WalletButton />
      {connected && <span className="text-green-500">Connected</span>}
    </div>
  );
};

export default WalletConnect; 