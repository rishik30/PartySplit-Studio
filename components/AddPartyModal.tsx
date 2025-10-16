import React, { useState } from 'react';
import { Party } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { XCircleIcon } from './icons/XCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Changed return type from Promise<void> to Promise<Party> to match parent component's prop.
  onAddParty: (party: Omit<Party, 'id' | 'friends' | 'tasks' | 'expenses'>) => Promise<Party>;
}

const AddPartyModal: React.FC<AddPartyModalProps> = ({ isOpen, onClose, onAddParty }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && date && !isLoading) {
      setIsLoading(true);
      await onAddParty({ name, date });
      setIsLoading(false);
      setName('');
      setDate('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
              <XCircleIcon />
            </button>
            <h2 className="text-2xl font-bold mb-4">Create a New Party</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="party-name" className="block text-sm font-medium text-text-secondary mb-1">Party Name</label>
                <input
                  id="party-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="party-date" className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                <input
                  id="party-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center disabled:bg-opacity-50"
              >
                {isLoading ? <SpinnerIcon /> : 'Create Party'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddPartyModal;