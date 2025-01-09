import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { SOLANA_NETWORK } from '../utils/constants';

export function useSolana() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) return;

    const connection = new Connection(`https://api.${SOLANA_NETWORK}.solana.com`);
    
    const fetchBalance = async () => {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance);
    };

    fetchBalance();
    const id = setInterval(fetchBalance, 10000);
    return () => clearInterval(id);
  }, [publicKey, connected]);

  return { balance };
} 