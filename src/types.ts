export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP';
  accountId?: string;
  isOffline?: boolean;
}

export interface Goal {
  id: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP';
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP';
  institution: string;
  isSynced: boolean;
  lastSynced?: string;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  category: string;
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP';
}

export interface Insight {
  category: string;
  title: string;
  description: string;
  potentialSavings: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const CURRENCY_SYMBOLS = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const EXCHANGE_RATES = {
  // Exchange rates relative to BRL (1 BRL = X other currency)
  BRL: { BRL: 1, USD: 0.18, EUR: 0.17, GBP: 0.14 },
  USD: { BRL: 5.5, USD: 1, EUR: 0.92, GBP: 0.78 },
  EUR: { BRL: 6.0, USD: 1.09, EUR: 1, GBP: 0.85 },
  GBP: { BRL: 7.1, USD: 1.28, EUR: 1.18, GBP: 1 }
};

export const CATEGORIES = [
  'Alimentação',
  'Assinaturas',
  'Transporte',
  'Lazer',
  'Moradia',
  'Saúde',
  'Educação',
  'Outros'
];

export const CATEGORY_COLORS: { [key: string]: string } = {
  Alimentação: 'bg-amber-500 text-white',
  Assinaturas: 'bg-indigo-500 text-white',
  Transporte: 'bg-blue-500 text-white',
  Lazer: 'bg-rose-500 text-white',
  Moradia: 'bg-emerald-500 text-white',
  Saúde: 'bg-cyan-500 text-white',
  Educação: 'bg-violet-500 text-white',
  Outros: 'bg-gray-500 text-white',
};

export const CATEGORY_COLORS_HEX: { [key: string]: string } = {
  Alimentação: '#F59E0B',
  Assinaturas: '#6366F1',
  Transporte: '#3B82F6',
  Lazer: '#F43F5E',
  Moradia: '#10B981',
  Saúde: '#06B6D4',
  Educação: '#8B5CF6',
  Outros: '#6B7280'
};
