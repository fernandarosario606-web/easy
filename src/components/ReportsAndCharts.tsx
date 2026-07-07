import React, { useMemo } from 'react';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie
} from 'recharts';
import { Download, FileSpreadsheet, FileText, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction, CURRENCY_SYMBOLS, CATEGORY_COLORS_HEX, EXCHANGE_RATES } from '../types';

interface ReportsAndChartsProps {
  transactions: Transaction[];
  currentCurrency: 'BRL' | 'USD' | 'EUR' | 'GBP';
}

export default function ReportsAndCharts({ transactions, currentCurrency }: ReportsAndChartsProps) {
  
  // Convert any transaction to current display currency for accurate aggregate calculations
  const getConvertedAmount = (amount: number, fromCurrency: string) => {
    if (fromCurrency === currentCurrency) return amount;
    const amountInBRL = amount * EXCHANGE_RATES[fromCurrency as 'BRL' | 'USD' | 'EUR' | 'GBP']['BRL'];
    return amountInBRL * EXCHANGE_RATES['BRL'][currentCurrency];
  };

  // 1. Calculate Summary Metrics
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      const converted = getConvertedAmount(t.amount, t.currency);
      if (t.type === 'income') {
        income += converted;
      } else {
        expense += converted;
      }
    });

    const cashFlow = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return {
      income,
      expense,
      cashFlow,
      savingsRate: Math.max(0, savingsRate)
    };
  }, [transactions, currentCurrency]);

  // 2. Format Category Data for Pie Chart (Expenses Only)
  const categoryData = useMemo(() => {
    const categoriesMap: { [key: string]: number } = {};
    
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const converted = getConvertedAmount(t.amount, t.currency);
        categoriesMap[t.category] = (categoriesMap[t.category] || 0) + converted;
      });

    return Object.keys(categoriesMap).map((cat) => ({
      name: cat,
      value: parseFloat(categoriesMap[cat].toFixed(2)),
      color: CATEGORY_COLORS_HEX[cat] || '#6B7280'
    })).sort((a, b) => b.value - a.value);
  }, [transactions, currentCurrency]);

  // 3. Format Monthly Data for Bar Chart (Cash Flow)
  const monthlyData = useMemo(() => {
    const monthsMap: { [key: string]: { income: number; expense: number } } = {};
    
    // Last 6 months structure
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Populate past transactions
    transactions.forEach((t) => {
      const date = new Date(t.date + 'T00:00:00');
      const monthLabel = `${monthsNames[date.getMonth()]}/${date.getFullYear().toString().substring(2)}`;
      const converted = getConvertedAmount(t.amount, t.currency);
      
      if (!monthsMap[monthLabel]) {
        monthsMap[monthLabel] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        monthsMap[monthLabel].income += converted;
      } else {
        monthsMap[monthLabel].expense += converted;
      }
    });

    return Object.keys(monthsMap).map((m) => ({
      name: m,
      Receitas: parseFloat(monthsMap[m].income.toFixed(2)),
      Despesas: parseFloat(monthsMap[m].expense.toFixed(2)),
    })).slice(-6); // Only show last 6 months of data
  }, [transactions, currentCurrency]);

  // 4. Export CSV Utility
  const handleExportCSV = () => {
    // Generate CSV contents
    const headers = ['ID', 'Descricao', 'Valor', 'Tipo', 'Categoria', 'Data', 'Moeda Original', 'Valor Convertido', 'Moeda Convertida'];
    const rows = transactions.map((t) => {
      const converted = getConvertedAmount(t.amount, t.currency);
      return [
        t.id,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        t.category,
        t.date,
        t.currency,
        converted.toFixed(2),
        currentCurrency
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `easy-relatorio-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. Trigger PDF print view (optimized via specific print-only CSS)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div id="reports-dashboard-panel" className="space-y-6 animate-fadeIn">
      {/* Header with quick export triggers */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 transition-all print:hidden">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white font-display">Relatórios e Contabilidade</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Analise seu fluxo de caixa, baixe planilhas de transações ou imprima relatórios oficiais</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            id="btn-export-csv"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-750 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Exportar CSV
          </button>

          <button
            onClick={handleExportPDF}
            id="btn-export-pdf"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-750 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            <FileText className="h-4 w-4 text-rose-500" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Printable Paper Header (visible on browser print only) */}
      <div className="hidden print:block p-8 bg-white border border-slate-300 rounded-2xl text-slate-900 mb-8 font-sans">
        <div className="flex justify-between items-center border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-display">EASY FINANCE</h1>
            <p className="text-sm text-slate-500">Relatório Consolidado de Fluxo de Caixa Mensal</p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            <p>Exportado por: {navigator.userAgent.substring(0, 30)}...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 py-6 border-b text-center">
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold font-mono">Total Receitas</p>
            <p className="text-lg font-black text-emerald-500">{CURRENCY_SYMBOLS[currentCurrency]} {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold font-mono">Total Despesas</p>
            <p className="text-lg font-black text-rose-500">{CURRENCY_SYMBOLS[currentCurrency]} {summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold font-mono">Saldo Período</p>
            <p className="text-lg font-black text-slate-900">{CURRENCY_SYMBOLS[currentCurrency]} {summary.cashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-bold font-mono">Taxa de Poupança</p>
            <p className="text-lg font-black text-emerald-400">{summary.savingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80 transition shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Receitas</span>
            <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-950 dark:text-white mt-2 font-display">
            {CURRENCY_SYMBOLS[currentCurrency]} {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> Todos os depósitos consolidados
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80 transition shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Despesas</span>
            <div className="h-7 w-7 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-950 dark:text-white mt-2 font-display">
            {CURRENCY_SYMBOLS[currentCurrency]} {summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <TrendingDown className="h-3 w-3 text-rose-500" /> Todas as saídas registradas
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80 transition shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Saldo Líquido</span>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${summary.cashFlow >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'}`}>
              <FileSpreadsheet className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className={`text-xl font-black mt-2 font-display ${summary.cashFlow >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            {CURRENCY_SYMBOLS[currentCurrency]} {summary.cashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            Resultado financeiro do mês corrente
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80 transition shadow-xs">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Taxa de Economia</span>
            <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-950 dark:text-white mt-2 font-display">
            {summary.savingsRate.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            Meta ideal saudável de economia: 20%+
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Line/Bar Chart (Left) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 transition-all shadow-xs">
          <h4 className="text-sm font-bold text-slate-950 dark:text-white mb-4 font-display">Fluxo de Caixa Mensal (Histórico)</h4>
          <div className="h-[280px] w-full">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                Dados insuficientes para renderizar o histórico de fluxo.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value) => `${CURRENCY_SYMBOLS[currentCurrency]} ${value}`} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Receitas" fill="#10B981" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#F43F5E" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown (Right) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 transition-all shadow-xs">
          <h4 className="text-sm font-bold text-slate-950 dark:text-white mb-4 font-display">Distribuição de Despesas</h4>
          <div className="h-[200px] w-full relative flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono text-center">
                Sem despesas<br />para categorizar.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${CURRENCY_SYMBOLS[currentCurrency]} ${value}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Custom Legend */}
          <div className="mt-4 max-h-[100px] overflow-y-auto space-y-1.5 pr-1">
            {categoryData.slice(0, 4).map((entry, index) => {
              const totalVal = categoryData.reduce((s, c) => s + c.value, 0);
              const percentage = totalVal > 0 ? ((entry.value / totalVal) * 100).toFixed(0) : 0;
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-700 dark:text-slate-300 truncate font-bold font-display">{entry.name}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 font-mono font-bold">
                    {CURRENCY_SYMBOLS[currentCurrency]}{entry.value.toLocaleString('pt-BR')} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
