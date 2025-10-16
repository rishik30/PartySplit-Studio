import React, { useMemo } from 'react';
import { Friend, Expense, Balance, SimplifiedDebt } from '../types';

interface BalanceSummaryProps {
  friends: Friend[];
  expenses: Expense[];
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ friends, expenses }) => {
  const simplifiedDebts = useMemo<SimplifiedDebt[]>(() => {
    if (friends.length === 0) return [];
    
    const balances: { [friendId: string]: number } = {};
    friends.forEach(f => { balances[f.id] = 0; });

    expenses.forEach(expense => {
      balances[expense.paidById] += expense.amount;
      
      const totalParticipants = expense.splitBetween.length;
      if (totalParticipants === 0) return;

      switch(expense.splitType) {
        case 'equally':
          const amountPerPerson = expense.amount / totalParticipants;
          expense.splitBetween.forEach(split => {
            balances[split.friendId] -= amountPerPerson;
          });
          break;
        case 'by_amount':
          expense.splitBetween.forEach(split => {
            balances[split.friendId] -= split.amount || 0;
          });
          break;
        case 'by_percentage':
          expense.splitBetween.forEach(split => {
            balances[split.friendId] -= expense.amount * ((split.percentage || 0) / 100);
          });
          break;
        case 'by_shares':
            const totalShares = expense.splitBetween.reduce((sum, s) => sum + (s.shares || 0), 0);
            if (totalShares > 0) {
                expense.splitBetween.forEach(split => {
                    balances[split.friendId] -= expense.amount * ((split.shares || 0) / totalShares);
                });
            }
            break;
      }
    });

    const debtors = Object.entries(balances)
      .filter(([, amount]) => amount < -0.01)
      .map(([id, amount]) => ({ id, amount }));
    
    const creditors = Object.entries(balances)
      .filter(([, amount]) => amount > 0.01)
      .map(([id, amount]) => ({ id, amount }));

    const debts: SimplifiedDebt[] = [];
    
    while(debtors.length > 0 && creditors.length > 0) {
        const debtor = debtors[0];
        const creditor = creditors[0];
        const amount = Math.min(-debtor.amount, creditor.amount);

        debts.push({
            from: friends.find(f => f.id === debtor.id)?.name || 'Unknown',
            to: friends.find(f => f.id === creditor.id)?.name || 'Unknown',
            amount: amount,
        });

        debtor.amount += amount;
        creditor.amount -= amount;

        if (Math.abs(debtor.amount) < 0.01) debtors.shift();
        if (Math.abs(creditor.amount) < 0.01) creditors.shift();
    }
    
    return debts;
  }, [friends, expenses]);

  const totalBalance = useMemo<Balance[]>(() => {
    // This is a simpler balance view for totals, not for settlement
    const balancesMap: { [friendId: string]: number } = {};
    friends.forEach(f => { balancesMap[f.id] = 0; });
    
    expenses.forEach(e => {
        balancesMap[e.paidById] = (balancesMap[e.paidById] || 0) + e.amount;
        // Simplified share calc for display
        e.splitBetween.forEach(s => {
            balancesMap[s.friendId] = (balancesMap[s.friendId] || 0) - (e.amount / e.splitBetween.length);
        });
    });

    return friends.map(f => ({
        friendId: f.id,
        name: f.name,
        amount: balancesMap[f.id] || 0
    })).sort((a,b) => b.amount - a.amount);
  }, [friends, expenses]);


  if (friends.length === 0) {
    return <p className="text-text-secondary">Add friends to see balances.</p>;
  }

  if (expenses.length === 0) {
    return <p className="text-text-secondary">Add an expense to start splitting.</p>;
  }

  return (
    <div className="space-y-4">
      {simplifiedDebts.length === 0 ? (
        <p className="text-secondary font-semibold text-center py-4">All settled up!</p>
      ) : (
        <ul className="space-y-2">
            {simplifiedDebts.map((debt, index) => (
                <li key={index} className="bg-surface-light p-3 rounded-md text-sm">
                    <span className="font-bold text-red-400">{debt.from}</span> owes <span className="font-bold text-green-400">{debt.to}</span> <span className="font-bold text-text">₹{debt.amount.toFixed(2)}</span>
                </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default BalanceSummary;