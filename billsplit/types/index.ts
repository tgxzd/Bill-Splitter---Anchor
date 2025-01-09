export interface Bill {
  address: string;
  creator: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  participants: string[];
  shares: number[];
  payments: number[];
  isSettled: boolean;
}

export interface Participant {
  address: string;
  share: number;
  paid: number;
} 