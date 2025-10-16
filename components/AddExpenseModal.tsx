import React, { useState, useEffect } from 'react';
import { Friend, Expense, SplitType, SplitDetail } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { XCircleIcon } from './icons/XCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onSaveExpense: (expense: Omit<Expense, 'id'> | Expense) => Promise<void>;
  expenseToEdit?: Expense | null;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, friends, onSaveExpense, expenseToEdit }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidById, setPaidById] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState<SplitType>('equally');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount);
      setPaidById(expenseToEdit.paidById);
      setDate(expenseToEdit.date);
      setSplitType(expenseToEdit.splitType);
      
      const participants = expenseToEdit.splitBetween.map(d => d.friendId);
      setSplitBetween(participants);

      if (expenseToEdit.splitType !== 'equally') {
        const custom: { [key: string]: number } = {};
        expenseToEdit.splitBetween.forEach(d => {
            let value = 0;
            if (expenseToEdit.splitType === 'by_amount') value = d.amount || 0;
            if (expenseToEdit.splitType === 'by_percentage') value = d.percentage || 0;
            if (expenseToEdit.splitType === 'by_shares') value = d.shares || 0;
            custom[d.friendId] = value;
        });
        setCustomSplits(custom);
      } else {
        setCustomSplits({});
      }
    } else {
      resetForm();
    }
  }, [expenseToEdit, isOpen, friends]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setSplitType('equally');
    if (friends.length > 0) {
        setPaidById(friends[0].id);
        setSplitBetween(friends.map(f => f.id));
    } else {
        setPaidById('');
        setSplitBetween([]);
    }
    setCustomSplits({});
    setError('');
  };

  const handleClose = () => {
    onClose();
  };
  
  const handleSplitBetweenChange = (friendId: string) => {
    setSplitBetween(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };
  
  const handleCustomSplitChange = (friendId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomSplits(prev => ({...prev, [friendId]: numValue}));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isSubmitting || !description || !amount || amount <= 0 || !paidById || splitBetween.length === 0) {
        setError("Please fill all required fields with valid values.");
        return;
    }
    
    setIsSubmitting(true);

    let splitDetails: SplitDetail[] = [];
    
    if (splitType === 'equally') {
        splitDetails = splitBetween.map(friendId => ({ friendId }));
    } else if (splitType === 'by_amount') {
        const total = splitBetween.reduce((sum, id) => sum + (customSplits[id] || 0), 0);
        if (Math.abs(total - amount) > 0.01) {
            setError(`Amounts must add up to ₹${amount.toFixed(2)}. Current total: ₹${total.toFixed(2)}`);
            setIsSubmitting(false);
            return;
        }
        splitDetails = splitBetween.map(friendId => ({ friendId, amount: customSplits[friendId] || 0 }));
    }
    //... similar logic for percentage and shares

    const expenseData = {
      description,
      amount,
      paidById,
      date,
      splitType,
      splitBetween: splitDetails,
    };

    if (expenseToEdit) {
      await onSaveExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
      await onSaveExpense(expenseData);
    }
    setIsSubmitting(false);
    handleClose();
  };

  const renderSplitInputs = () => {
      if (splitType === 'equally') return null;
      return (
          <div className="space-y-2 mt-2">
              {splitBetween.map(friendId => {
                  const friend = friends.find(f => f.id === friendId);
                  return (
                      <div key={friendId} className="flex items-center justify-between">
                          <label>{friend?.name}</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={customSplits[friendId] || ''}
                            onChange={e => handleCustomSplitChange(friendId, e.target.value)}
                            className="w-24 bg-surface border border-gray-600 rounded-md px-2 py-1 text-text focus:ring-primary focus:border-primary"
                          />
                      </div>
                  )
              })}
          </div>
      )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={handleClose}>
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="bg-surface rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClose} className="absolute top-4 right-4 text-text-secondary hover:text-text"><XCircleIcon /></button>
            <h2 className="text-2xl font-bold mb-4">{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary" required />
              <input type="number" placeholder="Amount" value={amount} step="0.01" min="0.01" onChange={e => setAmount(parseFloat(e.target.value) || '')} className="w-full bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary" required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Paid by</label>
                  <select value={paidById} onChange={e => setPaidById(e.target.value)} className="w-full bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary">
                    {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Split between</label>
                <div className="flex flex-wrap gap-2 p-2 bg-surface-light rounded-md">
                    {friends.map(f => (
                        <button 
                            key={f.id} 
                            type="button" 
                            onClick={() => handleSplitBetweenChange(f.id)} 
                            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                                splitBetween.includes(f.id) 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-surface text-text-secondary opacity-60 line-through hover:opacity-100'
                            }`}
                        >
                            {f.name}
                        </button>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Split method</label>
                <select value={splitType} onChange={e => setSplitType(e.target.value as SplitType)} className="w-full bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary">
                  <option value="equally">Equally</option>
                  <option value="by_amount">By exact amount</option>
                </select>
                {renderSplitInputs()}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-hover transition-colors flex items-center justify-center disabled:bg-opacity-50">
                {isSubmitting ? <SpinnerIcon /> : (expenseToEdit ? 'Save Changes' : 'Add Expense')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseModal;
