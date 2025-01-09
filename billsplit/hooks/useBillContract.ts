import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, SendTransactionError } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { PROGRAM_ID, LAMPORTS_PER_SOL } from '../utils/constants';
import { useCallback } from 'react';
import * as anchor from '@project-serum/anchor';

export const useBillContract = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const createBill = useCallback(
    async (
      name: string,
      totalAmount: number,
      participants: string[],
      shares: number[],
      participantName: string
    ) => {
      if (!publicKey) throw new Error('Wallet not connected');

      try {
        console.log('Starting bill creation with amount:', totalAmount);
        console.log('Creator wallet:', publicKey.toString());
        
        const [billPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('bill'),
            publicKey.toBuffer(),
            Buffer.from(name),
          ],
          new PublicKey(PROGRAM_ID)
        );
        
        console.log('Bill PDA:', billPDA.toString());

        // Check wallet balance first
        const balance = await connection.getBalance(publicKey);
        console.log('Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
        
        if (balance < totalAmount) {
          throw new Error(`Insufficient funds. Need ${totalAmount / LAMPORTS_PER_SOL} SOL but have ${balance / LAMPORTS_PER_SOL} SOL`);
        }

        const provider = new AnchorProvider(
          connection,
          window.solana,
          { commitment: 'confirmed' }
        );
        
        const program = new Program(
          require('../utils/smartcontract.json'),
          new PublicKey(PROGRAM_ID),
          provider
        );

        const tx = await program.methods
          .createBill(
            name,
            new anchor.BN(totalAmount),
            [publicKey],
            [new anchor.BN(totalAmount)],
            participantName
          )
          .accounts({
            bill: billPDA,
            creator: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('Transaction sent:', tx);
        
        const confirmation = await connection.confirmTransaction(tx, 'confirmed');
        console.log('Transaction confirmed:', confirmation);

        // Check balances after transaction
        const newBalance = await connection.getBalance(publicKey);
        const billBalance = await connection.getBalance(billPDA);
        
        console.log('New wallet balance:', newBalance / LAMPORTS_PER_SOL, 'SOL');
        console.log('Bill balance:', billBalance / LAMPORTS_PER_SOL, 'SOL');

        return tx;
      } catch (error) {
        console.error('Error creating bill:', error);
        if (error instanceof SendTransactionError) {
          console.error('Transaction logs:', error.logs);
        }
        throw error;
      }
    },
    [connection, publicKey, sendTransaction]
  );

  const getBills = useCallback(async () => {
    if (!publicKey) return [];

    try {
      const provider = new AnchorProvider(
        connection,
        window.solana,
        { preflightCommitment: 'processed' }
      );
      
      const program = new Program(
        require('../utils/smartcontract.json'),
        new PublicKey(PROGRAM_ID),
        provider
      );

      // Fetch all bills for the connected wallet
      const bills = await program.account.bill.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: publicKey.toBase58(),
          },
        },
      ]);

      return bills.map(({ account, publicKey: billPubkey }) => ({
        address: billPubkey.toString(),
        name: account.name,
        totalAmount: account.totalAmount.toNumber(),
        participantName: account.participantName,
        createdAt: Date.now(), // Fallback to current time if createdAt is not available
      }));
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }, [connection, publicKey]);

  return { createBill, getBills };
}; 