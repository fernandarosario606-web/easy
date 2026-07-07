import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Wallet, CreditCard, Calendar, Target, HelpCircle, 
  Moon, Sun, Plus, Search, Filter, TrendingUp, TrendingDown, RefreshCw, 
  Sparkles, DollarSign, ArrowUpRight, ArrowDownRight, Globe, Lock, Shield, Settings
} from 'lucide-react';

import { Transaction, Goal, Account, Reminder, Insight, CURRENCY_SYMBOLS, EXCHANGE_RATES, CATEGORIES, CATEGORY_COLORS } from './types';
import BiometricAuth from './components/BiometricAuth';
import BankSync from './components/BankSync';
import BudgetGoals from './components/BudgetGoals';
import PaymentReminders from './components/PaymentReminders';
import ReportsAndCharts from './components/ReportsAndCharts';
import CustomerSupportChat from './components/CustomerSupportChat';
import OfflineIndicator from './components/OfflineIndicator';

// ==========================================
// INITIAL DATASETS FOR EXCELLENT COLD LOAD
// ==========================================
const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Nubank Principal', type: 'checking', balance: 4850.00, currency: 'BRL', institution: 'Nubank', isSynced: true, lastSynced: '10:45' },
  { id: 'acc-2', name: 'Wise Global', type: 'checking', balance: 1250.00, currency: 'EUR', institution: 'Wise (Multi-Moedas)', isSynced: true, lastSynced: '11:15' },
  { id: 'acc-3', name: 'Chase USA', type: 'checking', balance: 800.00, currency: 'USD', institution: 'Chase Bank', isSynced: true, lastSynced: '09:30' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', description: 'Salário Mensal', amount: 6500.00, type: 'income', category: 'Outros', date: '2026-07-01', currency: 'BRL', accountId: 'acc-1' },
  { id: 'tx-2', description: 'Supermercado Pão de Açúcar', amount: 345.80, type: 'expense', category: 'Alimentação', date: '2026-07-02', currency: 'BRL', accountId: 'acc-1' },
  { id: 'tx-3', description: 'Assinatura Netflix Premium', amount: 55.90, type: 'expense', category: 'Assinaturas', date: '2026-07-03', currency: 'BRL', accountId: 'acc-1' },
  { id: 'tx-4', description: 'Uber Viagem', amount: 42.50, type: 'expense', category: 'Transporte', date: '2026-07-04', currency: 'BRL', accountId: 'acc-1' },
  { id: 'tx-5', description: 'Hospedagem de Férias Roma', amount: 150.00, type: 'expense', category: 'Lazer', date: '2026-07-02', currency: 'EUR', accountId: 'acc-2' },
  { id: 'tx-6', description: 'Freelance Design USD', amount: 450.00, type: 'income', category: 'Outros', date: '2026-07-05', currency: 'USD', accountId: 'acc-3' }
];

const INITIAL_REMINDERS: Reminder[] = [
  { id: 'rem-1', title: 'Aluguel do Apartamento', amount: 1800.00, dueDate: '2026-07-15', isPaid: false, category: 'Moradia', currency: 'BRL' },
  { id: 'rem-2', title: 'Fatura de Energia Enel', amount: 142.50, dueDate: '2026-07-08', isPaid: false, category: 'Moradia', currency: 'BRL' },
  { id: 'rem-3', title: 'Assinatura Spotify Família', amount: 34.90, dueDate: '2026-07-06', isPaid: true, category: 'Assinaturas', currency: 'BRL' }
];

const INITIAL_GOALS: Goal[] = [
  { id: 'goal-1', category: 'Alimentação', targetAmount: 800.00, currentAmount: 0, currency: 'BRL' },
  { id: 'goal-2', category: 'Assinaturas', targetAmount: 200.00, currentAmount: 0, currency: 'BRL' }
];

export default function App() {
  // ==========================================
  // STATE DEFINITIONS & CACHE LOADERS
  // ==========================================
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem('easy_transactions');
    return cached ? JSON.parse(cached) : INITIAL_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const cached = localStorage.getItem('easy_accounts');
    return cached ? JSON.parse(cached) : INITIAL_ACCOUNTS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const cached = localStorage.getItem('easy_reminders');
    return cached ? JSON.parse(cached) : INITIAL_REMINDERS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const cached = localStorage.getItem('easy_goals');
    return cached ? JSON.parse(cached) : INITIAL_GOALS;
  });

  const [currentCurrency, setCurrentCurrency] = useState<'BRL' | 'USD' | 'EUR' | 'GBP'>(() => {
    return (localStorage.getItem('easy_currency') as any) || 'BRL';
  });

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return localStorage.getItem('easy_is_offline') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('easy_dark_mode') === 'true';
  });

  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(() => {
    const cached = localStorage.getItem('easy_biometric_enabled');
    return cached ? cached === 'true' : true; // Default locked to show auth on startup
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'accounts' | 'reminders' | 'goals' | 'support'>('dashboard');

  // Transaction form states
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState(CATEGORIES[0]);
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txAccountId, setTxAccountId] = useState('');

  // AI Savings Tips state
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  // Filters for Transactions tab
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');

  // ==========================================
  // SYNCING / PERSISTENCE SIDE-EFFECTS
  // ==========================================
  useEffect(() => {
    localStorage.setItem('easy_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('easy_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('easy_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('easy_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('easy_currency', currentCurrency);
  }, [currentCurrency]);

  useEffect(() => {
    localStorage.setItem('easy_is_offline', String(isOffline));
  }, [isOffline]);

  useEffect(() => {
    localStorage.setItem('easy_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('easy_biometric_enabled', String(isBiometricEnabled));
  }, [isBiometricEnabled]);

  // Fetch Personalized Savings Insights via Express endpoint
  useEffect(() => {
    const fetchInsights = async () => {
      setIsInsightsLoading(true);
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions: transactions.slice(0, 15), // send recent 15 records for analysis
            goals,
            balance: totalBalance,
            currency: currentCurrency
          })
        });
        const data = await response.json();
        if (data.insights) {
          setInsights(data.insights);
        }
      } catch (error) {
        console.error('Failed to load AI insights:', error);
      } finally {
        setIsInsightsLoading(false);
      }
    };

    fetchInsights();
  }, [transactions, goals, currentCurrency]);

  // ==========================================
  // CURRENCY CONVERTER HELPERS
  // ==========================================
  const getConvertedAmount = (amount: number, fromCurrency: string) => {
    if (fromCurrency === currentCurrency) return amount;
    // Convert to BRL first as base, then convert BRL to target currency
    const rateToBRL = EXCHANGE_RATES[fromCurrency as 'BRL' | 'USD' | 'EUR' | 'GBP']['BRL'];
    const rateToTarget = EXCHANGE_RATES['BRL'][currentCurrency];
    const amountInBRL = amount * rateToBRL;
    return parseFloat((amountInBRL * rateToTarget).toFixed(2));
  };

  // Aggregators for top card balances
  const totalBalance = useMemo(() => {
    // 1. Convert accounts balance
    const accountsSum = accounts.reduce((sum, acc) => {
      return sum + getConvertedAmount(acc.balance, acc.currency);
    }, 0);

    // 2. Adjust with manual transactions that are not tied to active synced accounts to prevent double counting
    const manualSum = transactions.reduce((sum, tx) => {
      if (tx.accountId) return sum; // tied to account, balance already reflects it
      const val = getConvertedAmount(tx.amount, tx.currency);
      return sum + (tx.type === 'income' ? val : -val);
    }, 0);

    return parseFloat((accountsSum + manualSum).toFixed(2));
  }, [accounts, transactions, currentCurrency]);

  const totalIncomeThisMonth = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + getConvertedAmount(t.amount, t.currency), 0);
  }, [transactions, currentCurrency]);

  const totalExpenseThisMonth = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + getConvertedAmount(t.amount, t.currency), 0);
  }, [transactions, currentCurrency]);

  // ==========================================
  // TRANSACTION DISPATCHERS
  // ==========================================
  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (!txDescription.trim() || isNaN(amount) || amount <= 0) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: txDescription.trim(),
      amount,
      type: txType,
      category: txCategory,
      date: txDate,
      currency: currentCurrency,
      accountId: txAccountId || undefined,
      isOffline: isOffline
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update targeted account balance immediately if applicable
    if (txAccountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === txAccountId) {
            const balanceDiff = txType === 'income' ? amount : -amount;
            return { ...acc, balance: parseFloat((acc.balance + balanceDiff).toFixed(2)) };
          }
          return acc;
        })
      );
    }

    // Reset fields
    setTxDescription('');
    setTxAmount('');
    setShowAddTransaction(false);
  };

  const handleAddAccount = (newAcc: Account) => {
    setAccounts((prev) => [...prev, newAcc]);
  };

  const handleAddSyncedTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev]);
  };

  const handleAddGoal = (newGoal: Goal) => {
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleAddReminder = (newRem: Reminder) => {
    setReminders((prev) => [...prev, newRem]);
  };

  const handleToggleReminderPaid = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === reminderId) {
          const updatedPaid = !rem.isPaid;
          
          // Auto register transaction when marked as paid
          if (updatedPaid) {
            const autoTx: Transaction = {
              id: Math.random().toString(36).substr(2, 9),
              description: `Pagamento: ${rem.title}`,
              amount: rem.amount,
              type: 'expense',
              category: rem.category,
              date: new Date().toISOString().split('T')[0],
              currency: rem.currency,
              isOffline: isOffline
            };
            setTransactions((prev) => [autoTx, ...prev]);
          }
          
          return { ...rem, isPaid: updatedPaid };
        }
        return rem;
      })
    );
  };

  // ==========================================
  // FILTERED LIST BUILDERS
  // ==========================================
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchFilter.toLowerCase());
      const matchCategory = categoryFilter === 'Todas' || t.category === categoryFilter;
      const matchType = typeFilter === 'Todos' || t.type === typeFilter;
      return matchSearch && matchCategory && matchType;
    });
  }, [transactions, searchFilter, categoryFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300 font-sans pb-10">
      
      {/* Biometric lock overlay on boot */}
      <BiometricAuth 
        isEnabled={isBiometricEnabled && !isUnlocked} 
        onSuccess={() => setIsUnlocked(true)} 
      />

      {/* Navigation Topbar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-slate-950 font-black text-2xl font-display">e</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                easy<span className="text-emerald-500 underline decoration-2 underline-offset-4 font-bold">finance</span>
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">v1.2</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic simulated offline switcher */}
            <OfflineIndicator isOffline={isOffline} onToggle={setIsOffline} />

            {/* Biometric verification status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 text-right">
              <div>
                <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold font-mono uppercase tracking-wider leading-none">Biometria</p>
                <p className="text-[10px] text-emerald-500 font-bold font-display leading-none mt-0.5">Segurança Ativa</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <Shield className="h-3 w-3" />
              </div>
            </div>

            {/* Currency selector support */}
            <div className="flex items-center gap-0.5 rounded-full bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              {(['BRL', 'USD', 'EUR', 'GBP'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrentCurrency(curr)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                    currentCurrency === curr
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                      : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white font-medium'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Dark Mode switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              id="btn-toggle-theme"
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Offline Status Warning Bar */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-semibold tracking-wide shadow-xs animate-fadeIn flex items-center justify-center gap-1.5 print:hidden">
          <Shield className="h-4 w-4 shrink-0 animate-pulse" />
          <span>Suporte Offline Ativo: Consultas e inserções estão sendo processadas localmente.</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: NAVIGATION RAIL */}
          <nav className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none print:hidden">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all w-full shrink-0 lg:shrink cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" /> Painel Geral
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all w-full shrink-0 lg:shrink cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <Wallet className="h-4.5 w-4.5" /> Gastos e Transações
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all w-full shrink-0 lg:shrink cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <CreditCard className="h-4.5 w-4.5" /> Bancos Conectados
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all w-full shrink-0 lg:shrink cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" /> Contas e Lembretes
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all w-full shrink-0 lg:shrink cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <Target className="h-4.5 w-4.5" /> Metas Orçamentárias
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all w-full shrink-0 lg:shrink cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 dark:shadow-emerald-500/5 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60'
              }`}
            >
              <HelpCircle className="h-4.5 w-4.5" /> Suporte em Tempo Real
            </button>

            <div className="hidden lg:block border-t border-gray-100 dark:border-gray-800/80 my-4" />

            {/* Quick Lock option */}
            <div className="hidden lg:flex flex-col gap-3.5 px-5 py-4.5 rounded-3xl bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 text-xs shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5 font-display">
                <Lock className="h-4 w-4 text-emerald-500" /> Biometria easy
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">Protege os relatórios em todos os acessos</p>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ativar Lock</span>
                <button
                  onClick={() => setIsBiometricEnabled(!isBiometricEnabled)}
                  className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer ${isBiometricEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${isBiometricEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {isBiometricEnabled && (
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="w-full mt-2 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition cursor-pointer"
                >
                  Bloquear Tela Agora
                </button>
              )}
            </div>
          </nav>

          {/* RIGHT COLUMN: MAIN CONTENT ZONE */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* 1. VIEW TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Balance Cards Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Balance Card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-3xl text-slate-950 shadow-xl shadow-emerald-500/10">
                    <div className="absolute top-0 right-0 p-3 opacity-15">
                      <Wallet className="h-20 w-20 text-slate-950" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-950/80 font-black">Saldo Consolidado</span>
                    <h2 className="text-3xl font-black mt-2 font-display">
                      {CURRENCY_SYMBOLS[currentCurrency]} {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                    <div className="flex justify-between items-end mt-4">
                      <div className="text-[10px] text-slate-950/80 font-mono font-bold flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-slate-950/80" /> Câmbio Global Ativo
                      </div>
                      {isOffline && (
                        <div className="bg-slate-950/20 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-950 font-mono">MODO OFFLINE</div>
                      )}
                    </div>
                  </div>

                  {/* Monthly Incomes Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Receitas do Mês</span>
                      <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1 font-display">
                        + {CURRENCY_SYMBOLS[currentCurrency]} {totalIncomeThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /> Entradas e depósitos ativos
                    </p>
                  </div>

                  {/* Monthly Expenses Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Gastos do Mês</span>
                      <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-1 font-display">
                        - {CURRENCY_SYMBOLS[currentCurrency]} {totalExpenseThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
                      <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" /> Saídas e pagamentos recorrentes
                    </p>
                  </div>
                </div>

                {/* Quick Add Transaction and Savings Tips Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Quick Add Transaction Column */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white font-display">Lançamento Rápido</h3>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Inserir Gastos</span>
                    </div>

                    <form onSubmit={handleAddTransactionSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTxType('expense')}
                          className={`py-2 text-xs font-bold rounded-full border transition cursor-pointer ${
                            txType === 'expense'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 font-bold'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          Despesa
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxType('income')}
                          className={`py-2 text-xs font-bold rounded-full border transition cursor-pointer ${
                            txType === 'income'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 font-bold'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          Receita
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Padaria, Uber"
                            value={txDescription}
                            onChange={(e) => setTxDescription(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Valor ({CURRENCY_SYMBOLS[currentCurrency]})</label>
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={txAmount}
                            onChange={(e) => setTxAmount(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
                          <select
                            value={txCategory}
                            onChange={(e) => setTxCategory(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Origem da Conta</label>
                          <select
                            value={txAccountId}
                            onChange={(e) => setTxAccountId(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          >
                            <option value="">Lançamento Manual (Dinheiro)</option>
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        id="btn-submit-quick-transaction"
                        className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-slate-950 transition shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        Salvar Lançamento
                      </button>
                    </form>
                  </div>

                  {/* AI Economy Tips Column */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-1.5 font-display">
                          <Sparkles className="h-4.5 w-4.5 text-emerald-500" /> Dicas de Economia Inteligentes
                        </h3>
                        {isInsightsLoading && <RefreshCw className="h-4.5 w-4.5 animate-spin text-emerald-500" />}
                      </div>

                      <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                        {insights.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-mono leading-relaxed">
                            Aguardando inteligência artificial analisar suas transações...
                          </div>
                        ) : (
                          insights.map((ins, idx) => (
                            <div key={idx} className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80 transition">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 font-mono">
                                  {ins.category}
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                                  Salva: {CURRENCY_SYMBOLS[currentCurrency]} {getConvertedAmount(ins.potentialSavings, 'BRL').toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 font-display">{ins.title}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{ins.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 text-center font-mono">
                      Calculado automaticamente baseado em seu orçamento
                    </div>
                  </div>

                </div>

                {/* Sub-Components below: Financial reports and charts */}
                <ReportsAndCharts transactions={transactions} currentCurrency={currentCurrency} />

              </div>
            )}

            {/* 2. VIEW TAB: TRANSACTIONS LIST */}
            {activeTab === 'transactions' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 transition-all space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white font-display">Extrato de Lançamentos</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Visualize, filtre e pesquise por todas as movimentações financeiras das suas contas</p>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar transação..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 font-mono">Cat:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="Todas">Todas as Categorias</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 font-mono">Tipo:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="Todos">Todos</option>
                      <option value="income">Receitas</option>
                      <option value="expense">Despesas</option>
                    </select>
                  </div>
                </div>

                {/* Ledger list */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 mt-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Data</th>
                        <th className="p-4 text-right">Valor Original</th>
                        <th className="p-4 text-right">Valor Display</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500 font-mono">
                            Nenhuma transação encontrada correspondente aos filtros.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              {t.description}
                              {t.isOffline && (
                                <span className="ml-1.5 rounded-md bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 font-mono font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                  offline
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${CATEGORY_COLORS[t.category] || 'bg-slate-100 text-slate-600'}`}>
                                {t.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-slate-500">{t.date}</td>
                            <td className="p-4 text-right font-mono text-slate-500">
                              {CURRENCY_SYMBOLS[t.currency]} {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`p-4 text-right font-black font-mono ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'income' ? '+' : '-'} {CURRENCY_SYMBOLS[currentCurrency]} {getConvertedAmount(t.amount, t.currency).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. VIEW TAB: BANK ACCOUNTS */}
            {activeTab === 'accounts' && (
              <BankSync 
                accounts={accounts} 
                onAddAccount={handleAddAccount} 
                onAddTransactions={handleAddSyncedTransactions}
                currentCurrency={currentCurrency}
              />
            )}

            {/* 4. VIEW TAB: PAYMENT REMINDERS */}
            {activeTab === 'reminders' && (
              <PaymentReminders 
                reminders={reminders} 
                onAddReminder={handleAddReminder} 
                onToggleReminderPaid={handleToggleReminderPaid}
                currentCurrency={currentCurrency}
              />
            )}

            {/* 5. VIEW TAB: METAS ORÇAMENTÁRIAS */}
            {activeTab === 'goals' && (
              <BudgetGoals 
                goals={goals} 
                transactions={transactions} 
                onAddGoal={handleAddGoal} 
                onDeleteGoal={handleDeleteGoal}
                currentCurrency={currentCurrency}
              />
            )}

            {/* 6. VIEW TAB: CUSTOMER SUPPORT CHAT */}
            {activeTab === 'support' && (
              <CustomerSupportChat />
            )}

          </main>
        </div>
      </div>

      {/* Footer Status Bar matching Sleek design */}
      <footer className="mt-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-8 py-5 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              Sincronização Bancária Ativa: {accounts.filter(a => a.isSynced).length} Contas Conectadas
            </span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider font-mono">
            Última sincronização: Agora mesmo ({new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('support')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-full transition-all text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <div className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>Chat de Suporte em Tempo Real</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
