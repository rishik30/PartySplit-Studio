import { Party } from '../types';

const API_LATENCY = 500; // ms

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

export const getParties = (): Promise<Party[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getPartiesFromStorage());
    }, API_LATENCY);
  });
};

export const getParty = (id: string): Promise<Party | null> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const parties = getPartiesFromStorage();
            const party = parties.find(p => p.id === id) || null;
            resolve(party);
        }, API_LATENCY);
    });
}

export const createParty = (partyData: Omit<Party, 'id' | 'friends' | 'tasks' | 'expenses'>): Promise<Party> => {
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
};

export const updateParty = (updatedParty: Party): Promise<Party> => {
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
}

export const deleteParty = (id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const parties = getPartiesFromStorage();
            const updatedParties = parties.filter(p => p.id !== id);
            savePartiesToStorage(updatedParties);
            resolve();
        }, API_LATENCY);
    });
}
