import { useState, useEffect, useCallback } from 'react';
import { Party } from '../types';
import * as api from '../services/api';

const useParties = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchParties = useCallback(async () => {
    setLoading(true);
    const parties = await api.getParties();
    setParties(parties);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const addParty = async (party: Omit<Party, 'id' | 'friends' | 'tasks' | 'expenses'>) => {
    const newParty = await api.createParty(party);
    setParties(prev => [...prev, newParty]);
    return newParty;
  };
  
  const getPartyById = useCallback((id: string) => {
    return parties.find(p => p.id === id) || null;
  }, [parties]);


  const updateParty = async (updatedParty: Party) => {
    const party = await api.updateParty(updatedParty);
    setParties(prev => prev.map(p => p.id === party.id ? party : p));
    return party;
  };
  
  const deleteParty = async (id: string) => {
    await api.deleteParty(id);
    setParties(prev => prev.filter(p => p.id !== id));
  }

  return { parties, addParty, getPartyById, updateParty, deleteParty, loading };
};

export default useParties;
