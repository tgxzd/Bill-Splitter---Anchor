export interface Bill {
  name: string;
  totalAmount: number;
  participantName: string;
  createdAt: number;
  isPending?: boolean;
  address?: string;
  creator?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  isUnlocked: boolean;
}

export interface UserProgress {
  totalBillsPaid: number;
  totalAmountPaid: number;
  achievements: Achievement[];
  lastUpdated: number;
} 