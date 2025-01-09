'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletConnect: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="flex items-center space-x-4">
      <WalletMultiButton />
      {connected && <span className="text-green-500">Connected</span>}
    </div>
  );
};

export default WalletConnect; 