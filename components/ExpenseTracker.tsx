import React, { useState } from 'react';
import { Party, Expense } from '../types';
import BalanceSummary from './BalanceSummary';
import AddExpenseModal from './AddExpenseModal';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { motion } from 'framer-motion';

interface ExpenseTrackerProps {
  party: Party;
  onUpdateExpenses: (expenses: Expense[]) => Promise<void>;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ party, onUpdateExpenses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setExpenseToEdit(null);
  };

  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'> | Expense) => {
    if ('id' in expenseData) {
      // Update existing expense
      await onUpdateExpenses(party.expenses.map(e => e.id === expenseData.id ? expenseData : e));
    } else {
      // Add new expense
      const newExpense: Expense = { ...expenseData, id: new Date().toISOString() };
      await onUpdateExpenses([...party.expenses, newExpense]);
    }
  };
  
  const getFriendName = (id: string) => party.friends.find(f => f.id === id)?.name || 'Unknown';
  
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Expenses</h2>
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-lg hover:bg-secondary-hover transition-colors"
                >
                    <PlusIcon />
                    Add Expense
                </motion.button>
            </div>
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {party.expenses.length === 0 && <p className="text-text-secondary text-center py-8">No expenses added yet.</p>}
                {party.expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                    <motion.li 
                        key={exp.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-light p-4 rounded-md flex justify-between items-center group"
                    >
                        <div>
                            <p className="font-semibold">{exp.description}</p>
                            <p className="text-sm text-text-secondary">Paid by {getFriendName(exp.paidById)} on {new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-secondary">₹{exp.amount.toFixed(2)}</span>
                             <button 
                                onClick={() => handleOpenEditModal(exp)}
                                className="text-text-secondary opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                                aria-label="Edit expense"
                            >
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </div>
        <div className="bg-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Balance Summary</h2>
            <BalanceSummary friends={party.friends} expenses={party.expenses} />
        </div>
      </div>
       <AddExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        friends={party.friends}
        onSaveExpense={handleSaveExpense}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};

export default ExpenseTracker;
