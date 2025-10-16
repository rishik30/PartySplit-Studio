
export interface Friend {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  description: string;
  assignedTo?: string; // friendId
  deadline?: string;
  completed: boolean;
}

export type SplitType = 'equally' | 'by_amount' | 'by_percentage' | 'by_shares';

export interface SplitDetail {
  friendId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidById: string; // friendId
  date: string;
  splitType: SplitType;
  splitBetween: SplitDetail[];
}

export interface Party {
  id: string;
  name: string;
  date: string;
  friends: Friend[];
  tasks: Task[];
  expenses: Expense[];
}

export interface Balance {
    friendId: string;
    name: string;
    amount: number;
}

export interface SimplifiedDebt {
    from: string; // name
    to: string; // name
    amount: number;
}
