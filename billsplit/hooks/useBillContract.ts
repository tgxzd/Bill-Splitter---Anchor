import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, SendTransactionError } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { PROGRAM_ID, LAMPORTS_PER_SOL } from '../utils/constants';
import { useCallback } from 'react';
import * as anchor from '@project-serum/anchor';

export const useBillContract = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const getProgram = useCallback(() => {
    if (!publicKey) throw new Error('Wallet not connected');

    const provider = new AnchorProvider(
      connection,
      window.solana,
      { commitment: 'confirmed' }
    );
    
    return new Program(
      require('../utils/smartcontract.json'),
      new PublicKey(PROGRAM_ID),
      provider
    );
  }, [connection, publicKey]);

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
        
        const uniqueName = `${name}-${Date.now()}`;
        
        const [billPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('bill'),
            publicKey.toBuffer(),
            Buffer.from(uniqueName),
          ],
          new PublicKey(PROGRAM_ID)
        );
        
        console.log('Bill PDA:', billPDA.toString());

        const program = getProgram();
        const tx = await program.methods
          .createBill(
            uniqueName,
            new anchor.BN(totalAmount),
            participants.map(p => new PublicKey(p)),
            shares.map(s => new anchor.BN(s)),
            participantName
          )
          .accounts({
            bill: billPDA,
            creator: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('Transaction sent:', tx);
        await connection.confirmTransaction(tx, 'confirmed');
        console.log('Bill created successfully');

        return billPDA;
      } catch (error) {
        console.error('Error creating bill:', error);
        if (error instanceof SendTransactionError) {
          console.error('Transaction logs:', error.logs);
        }
        throw error;
      }
    },
    [connection, publicKey, getProgram]
  );

  const payBill = useCallback(
    async (billAddress: PublicKey, amount: number) => {
      if (!publicKey) throw new Error('Wallet not connected');

      try {
        console.log('Starting bill payment:', billAddress.toString());
        console.log('Amount:', amount);

        const program = getProgram();

        // Get the bill account first to verify it exists
        const billAccount = await program.account.bill.fetch(billAddress);
        console.log('Bill account:', billAccount);

        // Check wallet balance
        const balance = await connection.getBalance(publicKey);
        if (balance < amount) {
          throw new Error(`Insufficient funds. Need ${amount / LAMPORTS_PER_SOL} SOL but have ${balance / LAMPORTS_PER_SOL} SOL`);
        }

        // Create the transaction
        const transaction = new Transaction();

        // Add the transfer instruction
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: billAddress,
          lamports: amount,
        });

        transaction.add(transferInstruction);

        // Get the latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Send and confirm transaction
        const signature = await sendTransaction(transaction, connection);
        console.log('Payment transaction sent:', signature);

        await connection.confirmTransaction(signature, 'confirmed');
        console.log('Payment confirmed');

        return signature;
      } catch (error) {
        console.error('Error paying bill:', error);
        if (error instanceof SendTransactionError) {
          console.error('Transaction logs:', error.logs);
        }
        throw error;
      }
    },
    [connection, publicKey, getProgram, sendTransaction]
  );

  const getBills = useCallback(async () => {
    if (!publicKey) return [];

    try {
      const program = getProgram();

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
        creator: account.creator.toString(),
        name: account.name,
        totalAmount: account.totalAmount.toNumber(),
        participantName: account.participantName,
        createdAt: account.createdAt,
        isPending: !account.isPaid,
        paidAmount: 0,
        participants: [],
        shares: [],
        payments: [],
        isSettled: account.isPaid,
      }));
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }, [publicKey, getProgram]);

  return { createBill, payBill, getBills };
}; 