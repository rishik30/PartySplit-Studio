import React, { useState } from 'react';
import { Friend } from '../types';
import { motion } from 'framer-motion';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface FriendsListProps {
  friends: Friend[];
  onUpdateFriends: (friends: Friend[]) => Promise<void>;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, onUpdateFriends }) => {
  const [newFriendName, setNewFriendName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendName.trim() && !isAdding) {
      setIsAdding(true);
      const newFriend: Friend = {
        id: new Date().toISOString(),
        name: newFriendName.trim(),
      };
      await onUpdateFriends([...friends, newFriend]);
      setNewFriendName('');
      setIsAdding(false);
    }
  };

  const handleDeleteFriend = (id: string) => {
    onUpdateFriends(friends.filter(f => f.id !== id));
  };

  return (
    <div className="bg-surface p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Party Members</h2>
      <form onSubmit={handleAddFriend} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          placeholder="Add a new friend"
          className="flex-grow bg-surface-light border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isAdding}
          className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 w-24 disabled:bg-opacity-50"
        >
          {isAdding ? <SpinnerIcon /> : <><UserPlusIcon /> Add</>}
        </motion.button>
      </form>
      <ul className="space-y-2">
        {friends.map(friend => (
          <motion.li
            key={friend.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center justify-between bg-surface-light p-3 rounded-md"
          >
            <span className="font-medium">{friend.name}</span>
            <button onClick={() => handleDeleteFriend(friend.id)} className="text-text-secondary hover:text-red-400">
              <TrashIcon />
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
