import { Party } from '../types';

// --- Configuration ---
// Set this flag to true to use the backend API, or false for localStorage.
const USE_BACKEND_API = true;
const API_URL = 'http://localhost:5001/api';
const API_LATENCY = 500; // ms, for simulating network delay with localStorage

// --- Local Storage Implementation ---

const getPartiesFromStorage = (): Party[] => {
  try {
    const stored = localStorage.getItem('parties');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse parties from localStorage", error);
    return [];
  }
};

const savePartiesToStorage = (parties: Party[]) => {
  localStorage.setItem('parties', JSON.stringify(parties));
};

const localStorageApi = {
  getParties: (): Promise<Party[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(getPartiesFromStorage());
      }, API_LATENCY);
    });
  },

  getParty: (id: string): Promise<Party | null> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const parties = getPartiesFromStorage();
            const party = parties.find(p => p.id === id) || null;
            resolve(party);
        }, API_LATENCY);
    });
  },

  createParty: (partyData: Omit<Party, 'id' | 'friends' | 'tasks' | 'expenses'>): Promise<Party> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const parties = getPartiesFromStorage();
            const newParty: Party = {
                ...partyData,
                id: new Date().toISOString(),
                friends: [],
                tasks: [],
                expenses: [],
            };
            savePartiesToStorage([...parties, newParty]);
            resolve(newParty);
        }, API_LATENCY);
    });
  },

  updateParty: (updatedParty: Party): Promise<Party> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!updatedParty.id) {
                return reject(new Error("Party must have an ID to be updated."));
            }
            const parties = getPartiesFromStorage();
            const partyIndex = parties.findIndex(p => p.id === updatedParty.id);

            if (partyIndex === -1) {
                return reject(new Error("Party not found."));
            }
            
            parties[partyIndex] = updatedParty;
            savePartiesToStorage(parties);
            resolve(updatedParty);
        }, API_LATENCY);
    });
  },

  deleteParty: (id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const parties = getPartiesFromStorage();
            const updatedParties = parties.filter(p => p.id !== id);
            savePartiesToStorage(updatedParties);
            resolve();
        }, API_LATENCY);
    });
  }
};

// --- Backend API Implementation ---

const backendApi = {
  getParties: async (): Promise<Party[]> => {
    const response = await fetch(`${API_URL}/parties`);
    if (!response.ok) throw new Error('Failed to fetch parties');
    return response.json();
  },

  getParty: async (id: string): Promise<Party | null> => {
    const response = await fetch(`${API_URL}/parties/${id}`);
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch party');
    }
    return response.json();
  },

  createParty: async (partyData: Omit<Party, 'id' | 'friends' | 'tasks' | 'expenses'>): Promise<Party> => {
    const response = await fetch(`${API_URL}/parties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partyData),
    });
    if (!response.ok) throw new Error('Failed to create party');
    return await response.json();
  },

  updateParty: async (updatedParty: Party): Promise<Party> => {
    const response = await fetch(`${API_URL}/parties/${updatedParty.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedParty),
    });
    if (!response.ok) throw new Error('Failed to update party');
    return await response.json();
  },

  deleteParty: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/parties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete party');
  },
};

// --- Exported API ---
// The application will use the functions from the implementation selected by the USE_BACKEND_API flag.

export const getParties = USE_BACKEND_API ? backendApi.getParties : localStorageApi.getParties;
export const getParty = USE_BACKEND_API ? backendApi.getParty : localStorageApi.getParty;
export const createParty = USE_BACKEND_API ? backendApi.createParty : localStorageApi.createParty;
export const updateParty = USE_BACKEND_API ? backendApi.updateParty : localStorageApi.updateParty;
export const deleteParty = USE_BACKEND_API ? backendApi.deleteParty : localStorageApi.deleteParty;
