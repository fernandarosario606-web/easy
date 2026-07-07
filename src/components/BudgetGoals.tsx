import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, AlertTriangle, Plus, Trash2, CheckCircle, TrendingUp } from 'lucide-react';
import { Goal, Transaction, CATEGORIES, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../types';

interface BudgetGoalsProps {
  goals: Goal[];
  transactions: Transaction[];
  onAddGoal: (newGoal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  currentCurrency: 'BRL' | 'USD' | 'EUR' | 'GBP';
}

export default function BudgetGoals({ goals, transactions, onAddGoal, onDeleteGoal, currentCurrency }: BudgetGoalsProps) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalCategory, setGoalCategory] = useState(CATEGORIES[0]);
  const [goalAmount, setGoalAmount] = useState('500');

  // Helper to calculate total spent in a category, converting foreign currency transactions
  const getCategoryExpense = (category: string, targetCurrency: 'BRL' | 'USD' | 'EUR' | 'GBP') => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => {
        // Convert transaction currency to the target currency of the goal
        if (t.currency === targetCurrency) {
          return sum + t.amount;
        } else {
          const rateFromTxToBRL = EXCHANGE_RATES[t.currency]['BRL'];
          const rateFromBRLToTarget = EXCHANGE_RATES['BRL'][targetCurrency];
          const amountInBRL = t.amount * rateFromTxToBRL;
          const convertedAmount = amountInBRL * rateFromBRLToTarget;
          return sum + convertedAmount;
        }
      }, 0);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(goalAmount);
    if (!amount || amount <= 0) return;

    // Check if category already has a goal
    const exists = goals.find((g) => g.category === goalCategory && g.currency === currentCurrency);
    if (exists) {
      alert(`Você já possui uma meta configurada para a categoria ${goalCategory}. Edite ou remova a existente.`);
      return;
    }

    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      category: goalCategory,
      targetAmount: amount,
      currentAmount: 0, // Will be dynamically calculated on render
      currency: currentCurrency
    };

    onAddGoal(newGoal);
    setGoalAmount('500');
    setShowAddGoal(false);
  };

  return (
    <div id="budget-goals-panel" className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/50 transition-all animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2 font-display">
            <Target className="h-5 w-5 text-emerald-500" />
            Metas de Limite Orçamentário
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Defina limites de gastos mensais para categorias específicas e controle despesas
          </p>
        </div>

        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          id="btn-toggle-add-goal"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/10 hover:bg-emerald-400 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> {showAddGoal ? 'Cancelar' : 'Nova Meta'}
        </button>
      </div>

      {/* Add Goal Collapsible Form */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/20 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/5"
            onSubmit={handleCreateGoal}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 font-mono">Configurar Meta de Orçamento</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">Categoria de Gasto</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">
                  Limite Mensal ({CURRENCY_SYMBOLS[currentCurrency]})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-new-goal"
              className="mt-4 rounded-full bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-black text-slate-950 shadow-md transition cursor-pointer"
            >
              Adicionar Meta
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50 dark:bg-slate-950/20">
          <Target className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">Nenhuma meta configurada ainda</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            As metas orçamentárias ajudam você a evitar compras impulsivas. Defina tetos de gastos para Alimentação, Lazer ou Assinaturas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const spent = getCategoryExpense(goal.category, goal.currency);
            const percentage = Math.min((spent / goal.targetAmount) * 100, 100);
            const isOverLimit = spent > goal.targetAmount;
            const isWarning = spent >= goal.targetAmount * 0.75 && spent <= goal.targetAmount;

            let barColor = 'bg-emerald-500';
            if (isOverLimit) barColor = 'bg-rose-500';
            else if (isWarning) barColor = 'bg-amber-500';

            return (
              <div
                key={goal.id}
                className="rounded-3xl border border-slate-100 bg-slate-50/30 dark:border-slate-800/80 dark:bg-slate-900/40 p-5 transition hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                      {goal.category}
                      {isOverLimit && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 font-mono uppercase tracking-wider">
                          <AlertTriangle className="h-3 w-3" /> Limite Excedido
                        </span>
                      )}
                      {isWarning && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 font-mono uppercase tracking-wider">
                          <AlertTriangle className="h-3 w-3" /> Alerta (75%+)
                        </span>
                      )}
                      {!isOverLimit && !isWarning && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-mono uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3" /> Sob Controle
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Gasto: <span className="font-bold text-slate-700 dark:text-slate-300">{CURRENCY_SYMBOLS[goal.currency]} {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> de {CURRENCY_SYMBOLS[goal.currency]} {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Remover Meta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress bar container */}
                <div className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  <span>{percentage.toFixed(1)}% utilizado</span>
                  <span>{CURRENCY_SYMBOLS[goal.currency]} {(goal.targetAmount - spent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {isOverLimit ? 'excedidos' : 'restantes'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
