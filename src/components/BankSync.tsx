import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2, ShieldCheck, Plus, AlertCircle, Building2, Globe, Sparkles } from 'lucide-react';
import { Account, Transaction, CURRENCY_SYMBOLS } from '../types';

interface BankSyncProps {
  accounts: Account[];
  onAddAccount: (newAccount: Account) => void;
  onAddTransactions: (newTransactions: Transaction[]) => void;
  currentCurrency: 'BRL' | 'USD' | 'EUR' | 'GBP';
}

const SAMPLE_INSTITUTIONS = [
  { id: 'nubank', name: 'Nubank', logo: '🟣', region: 'Nacional', defaultCurrency: 'BRL' as const },
  { id: 'itau', name: 'Itaú Unibanco', logo: '🟠', region: 'Nacional', defaultCurrency: 'BRL' as const },
  { id: 'banco-do-brasil', name: 'Banco do Brasil', logo: '🟡', region: 'Nacional', defaultCurrency: 'BRL' as const },
  { id: 'wise', name: 'Wise (Multi-Moedas)', logo: '🟢', region: 'Internacional', defaultCurrency: 'EUR' as const },
  { id: 'chase', name: 'Chase Bank', logo: '🔵', region: 'Internacional', defaultCurrency: 'USD' as const },
  { id: 'revolut', name: 'Revolut', logo: '⚪', region: 'Internacional', defaultCurrency: 'GBP' as const },
];

export default function BankSync({ accounts, onAddAccount, onAddTransactions, currentCurrency }: BankSyncProps) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(SAMPLE_INSTITUTIONS[0]);
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'credit'>('checking');
  const [accountBalance, setAccountBalance] = useState('3500');
  const [accountName, setAccountName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  const handleConnectBank = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    setTimeout(() => {
      const generatedId = Math.random().toString(36).substr(2, 9);
      const name = accountName.trim() || `${selectedInstitution.name} (${accountType === 'checking' ? 'Corrente' : accountType === 'savings' ? 'Poupança' : 'Crédito'})`;
      
      const newAcc: Account = {
        id: generatedId,
        name,
        type: accountType,
        balance: parseFloat(accountBalance) || 0,
        currency: selectedInstitution.defaultCurrency,
        institution: selectedInstitution.name,
        isSynced: true,
        lastSynced: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      onAddAccount(newAcc);
      setIsConnecting(false);
      setShowConnectModal(false);
      
      // Inject 2 default transactions for this newly connected account immediately as initial sync
      const initialTransactions: Transaction[] = [
        {
          id: Math.random().toString(36).substr(2, 9),
          description: `Sinc. Inicial - ${selectedInstitution.name}`,
          amount: accountType === 'credit' ? -150 : 2000,
          type: accountType === 'credit' ? 'expense' : 'income',
          category: accountType === 'credit' ? 'Lazer' : 'Outros',
          date: new Date().toISOString().split('T')[0],
          currency: selectedInstitution.defaultCurrency,
          accountId: generatedId
        }
      ];
      onAddTransactions(initialTransactions);
      
      // Reset inputs
      setAccountName('');
      setAccountBalance('3500');
    }, 2000);
  };

  const handleManualSync = (acc: Account) => {
    setSyncingAccountId(acc.id);

    // Simulate calling financial institution Open Finance endpoints
    setTimeout(() => {
      const dateStr = new Date().toISOString().split('T')[0];
      
      // Generate some interesting transactions based on account type and region
      const syncTransactions: Transaction[] = [];
      const rand = Math.random();
      
      if (acc.currency === 'BRL') {
        syncTransactions.push(
          {
            id: Math.random().toString(36).substr(2, 9),
            description: 'Supermercado Open Finance',
            amount: 142.50,
            type: 'expense',
            category: 'Alimentação',
            date: dateStr,
            currency: 'BRL',
            accountId: acc.id
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            description: 'Transferência Recebida PIX',
            amount: 450.00,
            type: 'income',
            category: 'Outros',
            date: dateStr,
            currency: 'BRL',
            accountId: acc.id
          }
        );
      } else {
        syncTransactions.push(
          {
            id: Math.random().toString(36).substr(2, 9),
            description: 'Digital Subscription Sync',
            amount: 14.99,
            type: 'expense',
            category: 'Assinaturas',
            date: dateStr,
            currency: acc.currency,
            accountId: acc.id
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            description: 'International Freelance Net',
            amount: 320.00,
            type: 'income',
            category: 'Outros',
            date: dateStr,
            currency: acc.currency,
            accountId: acc.id
          }
        );
      }

      onAddTransactions(syncTransactions);
      setSyncingAccountId(null);
      
      // Update the account balance and sync date
      acc.lastSynced = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const netChange = syncTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
      acc.balance = parseFloat((acc.balance + netChange).toFixed(2));
    }, 2000);
  };

  return (
    <div id="bank-sync-panel" className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/50 transition-all animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2 font-display">
            <Building2 className="h-5 w-5 text-emerald-500" />
            Conexão Bancária Inteligente
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sincronização automática via Open Finance e APIs de câmbio internacional
          </p>
        </div>

        <button
          onClick={() => setShowConnectModal(true)}
          id="btn-connect-new-bank"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/10 hover:bg-emerald-400 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Conectar Banco
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50 dark:bg-slate-950/20">
          <Globe className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">Nenhuma conta bancária conectada</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Conecte suas contas nacionais e internacionais para sincronizar despesas e automatizar seu orçamento de forma integrada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/40 p-5 transition hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center gap-1 w-max font-mono uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> API Ativa
                  </span>
                  <h4 className="mt-2 text-sm font-bold text-slate-950 dark:text-white truncate font-display">{acc.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {acc.institution} • {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : 'Cartão de Crédito'}
                  </p>
                </div>
                
                <span className="text-xl">
                  {acc.institution.includes('Wise') ? '🟢' : acc.institution.includes('Nuban') ? '🟣' : acc.institution.includes('Ita') ? '🟠' : '🔵'}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Saldo Atual</p>
                  <p className="text-base font-black text-slate-950 dark:text-white font-display">
                    {CURRENCY_SYMBOLS[acc.currency]} {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Sinc: <span className="font-mono text-slate-900 dark:text-white font-bold">{acc.lastSynced || 'Nunca'}</span>
                  </p>
                  
                  <button
                    onClick={() => handleManualSync(acc)}
                    disabled={syncingAccountId === acc.id}
                    id={`btn-sync-bank-${acc.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncingAccountId === acc.id ? 'animate-spin' : ''}`} />
                    {syncingAccountId === acc.id ? 'Sincronizando...' : 'Sincronizar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connection Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="bg-emerald-500 dark:bg-emerald-500/10 px-6 py-4 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-950 dark:text-emerald-400 flex items-center gap-1.5 font-display uppercase tracking-wider">
                  <ShieldCheck className="h-4.5 w-4.5 text-slate-950 dark:text-emerald-400" />
                  Conexão de Conta Segura
                </h4>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-slate-950/80 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConnectBank} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    1. Selecione a Instituição Financeira
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_INSTITUTIONS.map((inst) => (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => setSelectedInstitution(inst)}
                        className={`flex items-center gap-2 rounded-2xl border p-3 text-left text-xs transition cursor-pointer ${
                          selectedInstitution.id === inst.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 dark:border-teal-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-lg">{inst.logo}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate font-display">{inst.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{inst.region} ({inst.defaultCurrency})</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">
                      Tipo de Conta
                    </label>
                    <select
                      value={accountType}
                      onChange={(e: any) => setAccountType(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="checking">Conta Corrente</option>
                      <option value="savings">Conta Poupança</option>
                      <option value="credit">Cartão de Crédito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">
                      Saldo Inicial ({selectedInstitution.defaultCurrency})
                    </label>
                    <input
                      type="number"
                      required
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Nome Identificador da Conta (Opcional)
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder={`Ex: Minha Conta ${selectedInstitution.name}`}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/10 p-3 border border-amber-200/55 dark:border-amber-900/30 text-[11px] text-amber-800 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Esta sincronização simula uma conexão segura em ambiente de Sandbox. Suas credenciais não são enviadas e dados de teste serão integrados com segurança.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  id="btn-submit-connect-bank"
                  className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/10 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Conectando via Open Finance...
                    </>
                  ) : (
                    'Autorizar e Sincronizar Conta'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
