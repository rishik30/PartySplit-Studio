import React, { useState } from 'react';
import { Party, Friend, Task, Expense } from '../types';
import FriendsList from './FriendsList';
import TaskList from './TaskList';
import ExpenseTracker from './ExpenseTracker';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
// FIX: Import AnimatePresence from framer-motion.
import { motion, AnimatePresence } from 'framer-motion';

interface PartyPageProps {
  party: Party;
  onUpdateParty: (party: Party) => Promise<Party>;
  onBack: () => void;
}

type Tab = 'expenses' | 'tasks' | 'friends';

const PartyPage: React.FC<PartyPageProps> = ({ party, onUpdateParty, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('expenses');

  // FIX: Wrap async function body in curly braces to ensure they return Promise<void>
  const updateFriends = async (friends: Friend[]) => { await onUpdateParty({ ...party, friends }); };
  const updateTasks = async (tasks: Task[]) => { await onUpdateParty({ ...party, tasks }); };
  const updateExpenses = async (expenses: Expense[]) => { await onUpdateParty({ ...party, expenses }); };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'expenses', label: 'Expenses' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'friends', label: 'Friends' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-4">
          <ArrowLeftIcon />
          Back to Parties
        </button>
        <h1 className="text-4xl font-bold">{party.name}</h1>
        <p className="text-text-secondary">{new Date(party.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="border-b border-surface-light mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm relative`}
            >
              {tab.label}
              {activeTab === tab.id && (
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="underline" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'expenses' && <ExpenseTracker party={party} onUpdateExpenses={updateExpenses} />}
                {activeTab === 'tasks' && <TaskList friends={party.friends} tasks={party.tasks} onUpdateTasks={updateTasks} />}
                {activeTab === 'friends' && <FriendsList friends={party.friends} onUpdateFriends={updateFriends} />}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartyPage;