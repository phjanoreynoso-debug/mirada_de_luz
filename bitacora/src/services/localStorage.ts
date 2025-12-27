import { v4 as uuidv4 } from 'uuid';

// Tipos base
export interface Client {
  id: string;
  name: string;
  email: string;
  notes: string;
  createdAt: string;
  clientReport?: string;
  ConsultantEnergies?: any[];
  Spreads?: any[];
  Rituals?: any[];
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // ISO string
  time: string;
  ConsultantId: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  ConsultantId: string;
  createdAt: string;
}

export interface EnergyLog {
  id: string;
  date: string;
  energyLevel: number;
  notes: string;
  createdAt: string;
}

export interface Ritual {
  id: string;
  name: string;
  type: string;
  date: string;
  notes: string;
  ConsultantId?: string;
  createdAt: string;
}

export interface Spread {
  id: string;
  question: string;
  interpretation: string;
  date: string;
  ConsultantId?: string;
  createdAt: string;
}

// Helper para localStorage
const getStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- CLIENTS SERVICE ---
export const clientService = {
  getAll: async () => {
    return getStorage<Client>('bitacora_clients');
  },
  getById: async (id: string) => {
    const clients = getStorage<Client>('bitacora_clients');
    const client = clients.find(c => c.id.toString() === id.toString());
    if (client) {
        // Enriquecer con relaciones simuladas si es necesario
        const energies = getStorage('bitacora_energy_consultant').filter((e: any) => e.ConsultantId === id);
        const spreads = getStorage('bitacora_spreads').filter((s: any) => s.ConsultantId === id);
        const rituals = getStorage('bitacora_rituals').filter((r: any) => r.ConsultantId === id);
        return { ...client, ConsultantEnergies: energies, Spreads: spreads, Rituals: rituals };
    }
    return null;
  },
  create: async (client: Omit<Client, 'id' | 'createdAt'>) => {
    const clients = getStorage<Client>('bitacora_clients');
    const newClient = { ...client, id: uuidv4(), createdAt: new Date().toISOString() };
    clients.push(newClient);
    setStorage('bitacora_clients', clients);
    return newClient;
  },
  update: async (id: string, updates: Partial<Client>) => {
    const clients = getStorage<Client>('bitacora_clients');
    const index = clients.findIndex(c => c.id.toString() === id.toString());
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updates };
      setStorage('bitacora_clients', clients);
      return clients[index];
    }
    throw new Error('Client not found');
  },
  delete: async (id: string) => {
    let clients = getStorage<Client>('bitacora_clients');
    clients = clients.filter(c => c.id.toString() !== id.toString());
    setStorage('bitacora_clients', clients);
  }
};

// --- APPOINTMENTS SERVICE ---
export const appointmentService = {
  getAll: async () => {
    return getStorage<Appointment>('bitacora_appointments');
  },
  create: async (apt: Omit<Appointment, 'id' | 'createdAt'>) => {
    const appointments = getStorage<Appointment>('bitacora_appointments');
    const newApt = { ...apt, id: uuidv4(), createdAt: new Date().toISOString() };
    appointments.push(newApt);
    setStorage('bitacora_appointments', appointments);
    return newApt;
  },
  update: async (id: string, updates: Partial<Appointment>) => {
    const appointments = getStorage<Appointment>('bitacora_appointments');
    const index = appointments.findIndex(a => a.id.toString() === id.toString());
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      setStorage('bitacora_appointments', appointments);
      return appointments[index];
    }
    throw new Error('Appointment not found');
  },
  delete: async (id: string) => {
    let appts = getStorage<Appointment>('bitacora_appointments');
    appts = appts.filter(a => a.id.toString() !== id.toString());
    setStorage('bitacora_appointments', appts);
  }
};

// --- TRANSACTIONS SERVICE ---
export const transactionService = {
  getAll: async () => {
    return getStorage<Transaction>('bitacora_transactions');
  },
  create: async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transactions = getStorage<Transaction>('bitacora_transactions');
    const newTx = { ...tx, id: uuidv4(), createdAt: new Date().toISOString() };
    transactions.push(newTx);
    setStorage('bitacora_transactions', transactions);
    return newTx;
  },
  delete: async (id: string) => {
    let txs = getStorage<Transaction>('bitacora_transactions');
    txs = txs.filter(t => t.id.toString() !== id.toString());
    setStorage('bitacora_transactions', txs);
  }
};

// --- GENERIC SERVICES (Energy, Rituals, Spreads) ---
export const consultantEnergyService = {
  getAll: async () => getStorage<any>('bitacora_energy_consultant'),
  create: async (data: any) => {
    const list = getStorage<any>('bitacora_energy_consultant');
    const newItem = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    list.push(newItem);
    setStorage('bitacora_energy_consultant', list);
    return newItem;
  },
  update: async (id: string, updates: any) => {
    const list = getStorage<any>('bitacora_energy_consultant');
    const index = list.findIndex(i => i.id.toString() === id.toString());
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setStorage('bitacora_energy_consultant', list);
      return list[index];
    }
    throw new Error('Item not found');
  },
  delete: async (id: string) => {
    let list = getStorage<any>('bitacora_energy_consultant');
    list = list.filter(i => i.id.toString() !== id.toString());
    setStorage('bitacora_energy_consultant', list);
  }
};

export const energyService = {
  getAll: async () => getStorage<EnergyLog>('bitacora_energy'),
  create: async (data: any) => {
    const list = getStorage<EnergyLog>('bitacora_energy');
    const newItem = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    list.push(newItem);
    setStorage('bitacora_energy', list);
    return newItem;
  },
  update: async (id: string, updates: any) => {
    const list = getStorage<EnergyLog>('bitacora_energy');
    const index = list.findIndex(i => i.id.toString() === id.toString());
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setStorage('bitacora_energy', list);
      return list[index];
    }
    throw new Error('Item not found');
  },
  delete: async (id: string) => {
    let list = getStorage<EnergyLog>('bitacora_energy');
    list = list.filter(i => i.id.toString() !== id.toString());
    setStorage('bitacora_energy', list);
  }
};

export const ritualService = {
  getAll: async () => getStorage<Ritual>('bitacora_rituals'),
  create: async (data: any) => {
    const list = getStorage<Ritual>('bitacora_rituals');
    const newItem = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    list.push(newItem);
    setStorage('bitacora_rituals', list);
    return newItem;
  },
  update: async (id: string, updates: any) => {
    const list = getStorage<Ritual>('bitacora_rituals');
    const index = list.findIndex(i => i.id.toString() === id.toString());
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setStorage('bitacora_rituals', list);
      return list[index];
    }
    throw new Error('Item not found');
  },
  delete: async (id: string) => {
    let list = getStorage<Ritual>('bitacora_rituals');
    list = list.filter(i => i.id.toString() !== id.toString());
    setStorage('bitacora_rituals', list);
  }
};

export const spreadService = {
  getAll: async () => getStorage<Spread>('bitacora_spreads'),
  create: async (data: any) => {
    const list = getStorage<Spread>('bitacora_spreads');
    const newItem = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    list.push(newItem);
    setStorage('bitacora_spreads', list);
    return newItem;
  },
  update: async (id: string, updates: any) => {
    const list = getStorage<Spread>('bitacora_spreads');
    const index = list.findIndex(i => i.id.toString() === id.toString());
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setStorage('bitacora_spreads', list);
      return list[index];
    }
    throw new Error('Item not found');
  },
  delete: async (id: string) => {
    let list = getStorage<Spread>('bitacora_spreads');
    list = list.filter(i => i.id.toString() !== id.toString());
    setStorage('bitacora_spreads', list);
  }
};
