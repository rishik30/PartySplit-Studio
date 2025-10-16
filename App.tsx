import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import PartyPage from './components/PartyPage';
import useParties from './hooks/useParties';
import { AnimatePresence, motion } from 'framer-motion';
import { Party } from './types';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

const App: React.FC = () => {
  const {
    parties,
    addParty,
    updateParty,
    deleteParty,
    getPartyById,
    loading: partiesLoading,
  } = useParties();
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  useEffect(() => {
    if (selectedPartyId) {
      setSelectedParty(getPartyById(selectedPartyId));
    } else {
      setSelectedParty(null);
    }
  }, [selectedPartyId, parties, getPartyById]);

  const handleSelectParty = (id: string) => {
    setSelectedPartyId(id);
  };

  const handleBackToHome = () => {
    setSelectedPartyId(null);
  };

  if (partiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerIcon className="w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6 md:p-8">
      <AnimatePresence mode="wait">
        {!selectedParty ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage
              parties={parties}
              onSelectParty={handleSelectParty}
              // FIX: Wrap addParty to match the expected Promise<void> return type.
              onAddParty={async (party) => { await addParty(party); }}
              onDeleteParty={deleteParty}
            />
          </motion.div>
        ) : (
          <motion.div
            key="party"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PartyPage
              party={selectedParty}
              onUpdateParty={updateParty}
              onBack={handleBackToHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;