import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Bell, Plus, Check, Clock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Reminder, CURRENCY_SYMBOLS, CATEGORIES } from '../types';

interface PaymentRemindersProps {
  reminders: Reminder[];
  onAddReminder: (newReminder: Reminder) => void;
  onToggleReminderPaid: (reminderId: string) => void;
  currentCurrency: 'BRL' | 'USD' | 'EUR' | 'GBP';
}

export default function PaymentReminders({ reminders, onAddReminder, onToggleReminderPaid, currentCurrency }: PaymentRemindersProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderAmount, setReminderAmount] = useState('80');
  const [reminderDueDate, setReminderDueDate] = useState('');
  const [reminderCategory, setReminderCategory] = useState(CATEGORIES[0]);

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(reminderAmount);
    if (!reminderTitle.trim() || !reminderDueDate || isNaN(amount) || amount <= 0) return;

    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      title: reminderTitle.trim(),
      amount,
      dueDate: reminderDueDate,
      isPaid: false,
      category: reminderCategory,
      currency: currentCurrency
    };

    onAddReminder(newReminder);
    setReminderTitle('');
    setReminderAmount('80');
    setReminderDueDate('');
    setShowAddForm(false);
  };

  // Status computation helpers
  const getStatus = (rem: Reminder) => {
    if (rem.isPaid) return 'paid';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(rem.dueDate + 'T00:00:00');
    due.setHours(0, 0, 0, 0);

    if (due.getTime() < today.getTime()) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'pending';
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.isPaid && !b.isPaid) return 1;
    if (!a.isPaid && b.isPaid) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const activeAlertsCount = reminders.filter(r => {
    const status = getStatus(r);
    return status === 'overdue' || status === 'today';
  }).length;

  return (
    <div id="payment-reminders-panel" className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/50 transition-all animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2 font-display">
            <Bell className="h-5 w-5 text-emerald-500" />
            Lembretes e Contas
            {activeAlertsCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-bounce">
                {activeAlertsCount}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe contas a pagar, vencimentos recorrentes e evite juros por atraso
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          id="btn-toggle-reminder-form"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/10 hover:bg-emerald-400 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> {showAddForm ? 'Cancelar' : 'Agendar Conta'}
        </button>
      </div>

      {activeAlertsCount > 0 && (
        <div className="mb-4 flex items-start gap-2.5 rounded-3xl bg-rose-50 border border-rose-200/50 p-4 text-xs text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          <AlertCircle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-bold font-display">Atenção ao Vencimento!</p>
            <p className="mt-0.5 opacity-90">
              Você possui {activeAlertsCount} conta{activeAlertsCount > 1 ? 'as' : ''} que vence{activeAlertsCount > 1 ? 'm' : 'se'} hoje ou está{activeAlertsCount > 1 ? 'm' : ''} atrasada{activeAlertsCount > 1 ? 'as' : ''}. Efetue o pagamento para manter seu score saudável.
            </p>
          </div>
        </div>
      )}

      {/* Add Reminder Collapsible Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/20 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/5"
            onSubmit={handleCreateReminder}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 font-mono">Agendar Novo Pagamento</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">Título da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Netflix, Aluguel"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">Valor ({CURRENCY_SYMBOLS[currentCurrency]})</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={reminderAmount}
                  onChange={(e) => setReminderAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">Vencimento</label>
                <input
                  type="date"
                  required
                  value={reminderDueDate}
                  onChange={(e) => setReminderDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">Categoria</label>
                <select
                  value={reminderCategory}
                  onChange={(e) => setReminderCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-new-reminder"
              className="mt-4 rounded-full bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-black text-slate-950 shadow-md transition cursor-pointer"
            >
              Adicionar Lembrete
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50 dark:bg-slate-950/20">
          <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">Sem contas agendadas</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Agende suas faturas mensais, serviços recorrentes ou tributos para nunca mais esquecer um pagamento ou pagar multas.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[400px] overflow-y-auto pr-1">
          {sortedReminders.map((rem) => {
            const status = getStatus(rem);
            const formattedDate = new Date(rem.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short'
            });

            return (
              <div
                key={rem.id}
                className={`flex items-center justify-between py-4 transition ${
                  rem.isPaid ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Mark as paid tick button */}
                  <button
                    onClick={() => onToggleReminderPaid(rem.id)}
                    id={`btn-toggle-reminder-paid-${rem.id}`}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition cursor-pointer ${
                      rem.isPaid
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-300 hover:border-emerald-500 bg-white dark:bg-slate-800 dark:border-slate-700'
                    }`}
                  >
                    {rem.isPaid && <Check className="h-4.5 w-4.5 stroke-[3]" />}
                  </button>

                  <div>
                    <h4 className={`text-sm font-bold text-slate-950 dark:text-white font-display ${rem.isPaid ? 'line-through opacity-70' : ''}`}>
                      {rem.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                        {rem.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Vence em {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-950 dark:text-white font-display">
                    {CURRENCY_SYMBOLS[rem.currency]} {rem.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  
                  <div className="mt-1 flex justify-end">
                    {status === 'paid' && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-mono uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" /> Pago
                      </span>
                    )}
                    {status === 'overdue' && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 font-mono uppercase tracking-wider animate-pulse">
                        Atrasado
                      </span>
                    )}
                    {status === 'today' && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 font-mono uppercase tracking-wider">
                        Vence Hoje
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-850 dark:text-slate-300 font-mono uppercase tracking-wider">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
