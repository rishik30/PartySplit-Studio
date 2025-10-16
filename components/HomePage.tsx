import React, { useState } from 'react';
import { Party } from '../types';
import AddPartyModal from './AddPartyModal';
import { motion } from 'framer-motion';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface HomePageProps {
  parties: Party[];
  onSelectParty: (id: string) => void;
  // FIX: Changed return type from Promise<void> to Promise<Party> to match the hook's signature.
  onAddParty: (party: Omit<Party, 'id' | 'friends' | 'tasks' | 'expenses'>) => Promise<Party>;
  onDeleteParty: (id: string) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const HomePage: React.FC<HomePageProps> = ({ parties, onSelectParty, onAddParty, onDeleteParty }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, partyId: string) => {
    e.stopPropagation();
    setDeletingId(partyId);
    await onDeleteParty(partyId);
    setDeletingId(null);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          PartySplit
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary-hover transition-colors"
        >
          <PlusIcon />
          New Party
        </motion.button>
      </header>

      {parties.length === 0 ? (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2 text-text-secondary">No parties yet!</h2>
            <p className="text-text-secondary">Click "New Party" to get started.</p>
        </div>
      ) : (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {parties.map(party => (
            <motion.div
              key={party.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative bg-surface rounded-xl shadow-md overflow-hidden cursor-pointer group"
              onClick={() => onSelectParty(party.id)}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">{party.name}</h3>
                <p className="text-sm text-text-secondary">{new Date(party.date).toLocaleDateString()}</p>
                <div className="mt-4 flex -space-x-2">
                  {party.friends.slice(0, 5).map(f => (
                    <div key={f.id} className="w-8 h-8 rounded-full bg-surface-light border-2 border-surface flex items-center justify-center text-sm font-bold text-text">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {party.friends.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-surface-light border-2 border-surface flex items-center justify-center text-xs font-bold text-text">
                      +{party.friends.length - 5}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={(e) => handleDelete(e, party.id)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-surface-light opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-all duration-200 flex items-center justify-center w-7 h-7"
                aria-label="Delete party"
                disabled={deletingId === party.id}
              >
                  {deletingId === party.id ? <SpinnerIcon className="w-4 h-4" /> : <TrashIcon className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AddPartyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddParty={onAddParty}
      />
    </div>
  );
};

export default HomePage;