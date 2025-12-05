import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, DollarSign, PieChart, TrendingUp, TrendingDown, 
  Wallet, AlertCircle, Save, Calculator, Home, Calendar, ArrowRight
} from 'lucide-react';

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon, colorClass, total }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    <span className="font-bold text-slate-700">
      ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  </div>
);

const InputRow = ({ item, onChange, onDelete }) => (
  <div className="flex gap-2 items-center p-2 hover:bg-slate-50 transition-colors group">
    <input
      type="text"
      placeholder="Label (e.g., Rent)"
      value={item.name}
      onChange={(e) => onChange(item.id, 'name', e.target.value)}
      className="flex-1 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <div className="relative w-32">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
      <input
        type="number"
        placeholder="0.00"
        value={item.amount}
        onChange={(e) => onChange(item.id, 'amount', parseFloat(e.target.value) || 0)}
        className="w-full pl-6 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right font-mono"
      />
    </div>
    <button
      onClick={() => onDelete(item.id)}
      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      title="Remove item"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

const CategorySection = ({ title, icon, colorClass, items, onAdd, onUpdate, onDelete }) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="h-full flex flex-col">
      <SectionHeader title={title} icon={icon} colorClass={colorClass} total={total} />
      <div className="p-4 flex-1 flex flex-col gap-2">
        {items.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-sm italic">
            No items yet. Add one to get started.
          </div>
        )}
        {items.map(item => (
          <InputRow
            key={item.id}
            item={item}
            onChange={onUpdate}
            onDelete={onDelete}
          />
        ))}
        <button
          onClick={onAdd}
          className="mt-2 w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-slate-300 hover:border-blue-300 transition-all"
        >
          <Plus size={16} /> Add {title} Item
        </button>
      </div>
    </Card>
  );
};

// --- Custom Donut Chart (SVG) ---
const DonutChart = ({ data, total }) => {
  if (total === 0) return (
    <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-full aspect-square max-w-[250px] mx-auto">
      <div className="text-center">
        <PieChart className="mx-auto mb-2 opacity-50" size={32} />
        <span className="text-xs">Add data to visualize</span>
      </div>
    </div>
  );

  let cumulativePercent = 0;

  return (
    <div className="relative max-w-[250px] mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        {data.map((slice, i) => {
          if (slice.value === 0) return null;
          const percent = slice.value / total;
          const strokeDasharray = `${percent * 314} 314`; // 2 * pi * r (r=50) approx 314
          const strokeDashoffset = -cumulativePercent * 314;
          cumulativePercent += percent;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="16"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out hover:opacity-80"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
        <span className="text-xs text-slate-400 font-medium">Total Outflow</span>
        <span className="text-xl font-bold text-slate-800">
          ${total.toLocaleString('en-US', { notation: "compact", compactDisplay: "short" })}
        </span>
      </div>
    </div>
  );
};

// --- Main App Component ---

const initialData = {
  income: 5000,
  debts: [
    { id: '1', name: 'Car Loan', amount: 350 },
    { id: '2', name: 'Credit Card', amount: 150 },
  ],
  expenses: [
    { id: '1', name: 'Rent/Mortgage', amount: 1200 },
    { id: '2', name: 'Groceries', amount: 400 },
    { id: '3', name: 'Utilities', amount: 150 },
  ],
  savings: [
    { id: '1', name: 'Emergency Fund', amount: 300 },
  ],
  investments: [
    { id: '1', name: '401k / Roth', amount: 500 },
  ]
};

export default function WealthFlowCalculator() {
  const [data, setData] = useState(() => {
    // Try to load from local storage
    try {
      const saved = localStorage.getItem('wealthflow_data');
      return saved ? JSON.parse(saved) : initialData;
    } catch (e) {
      return initialData;
    }
  });

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem('wealthflow_data', JSON.stringify(data));
  }, [data]);

  const updateIncome = (amount) => {
    setData(prev => ({ ...prev, income: amount }));
  };

  const addItem = (category) => {
    const newItem = { id: Date.now().toString(), name: '', amount: 0 };
    setData(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));
  };

  const updateItem = (category, id, field, value) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const deleteItem = (category, id) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  // Calculations
  const totals = useMemo(() => ({
    debts: data.debts.reduce((sum, item) => sum + item.amount, 0),
    expenses: data.expenses.reduce((sum, item) => sum + item.amount, 0),
    savings: data.savings.reduce((sum, item) => sum + item.amount, 0),
    investments: data.investments.reduce((sum, item) => sum + item.amount, 0),
  }), [data]);

  const totalOutflow = totals.debts + totals.expenses + totals.savings + totals.investments;
  const remaining = data.income - totalOutflow;
  const savingsRate = data.income > 0 ? ((totals.savings + totals.investments) / data.income) * 100 : 0;

  const chartData = [
    { label: 'Debts', value: totals.debts, color: '#f43f5e' }, // Rose 500
    { label: 'Expenses', value: totals.expenses, color: '#f59e0b' }, // Amber 500
    { label: 'Savings', value: totals.savings, color: '#3b82f6' }, // Blue 500
    { label: 'Investments', value: totals.investments, color: '#10b981' }, // Emerald 500
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Wallet size={24} />
              </div>
              WealthFlow
            </h1>
            <p className="text-slate-500 mt-1">Plan your monthly budget and visualize your future.</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex items-center gap-4">
            <div className="text-right">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Monthly Net Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={data.income}
                  onChange={(e) => updateIncome(parseFloat(e.target.value) || 0)}
                  className="w-40 pl-6 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart Card */}
          <Card className="p-6 flex flex-col items-center justify-center md:col-span-1">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Distribution</h3>
            <DonutChart data={chartData} total={totalOutflow} />
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-6 w-full px-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-slate-600">{d.label}</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {Math.round((d.value / (totalOutflow || 1)) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats Summary */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
               <div>
                 <div className="flex items-center gap-2 opacity-80 mb-2">
                   <TrendingUp size={20} />
                   <span className="text-sm font-medium">Remaining Budget</span>
                 </div>
                 <div className="text-4xl font-bold">
                   ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                 </div>
               </div>
               <div className="mt-4 pt-4 border-t border-blue-500/30">
                 <p className="text-sm opacity-90">
                   {remaining >= 0 
                     ? "You are within your budget! Great job." 
                     : "You are overspending. Review your expenses."}
                 </p>
               </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Save size={20} />
                  <span className="text-sm font-medium uppercase tracking-wider">Savings Rate</span>
                </div>
                <div className="text-4xl font-bold text-slate-800">
                  {savingsRate.toFixed(1)}%
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${savingsRate > 20 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(savingsRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">Target: 20% recommended</p>
              </div>
            </Card>

            <Card className="p-4 sm:col-span-2 bg-amber-50 border-amber-100">
               <div className="flex items-start gap-3">
                 <AlertCircle className="text-amber-500 shrink-0 mt-1" size={20} />
                 <div>
                   <h4 className="font-semibold text-amber-800">Financial Snapshot</h4>
                   <ul className="text-sm text-amber-700 mt-1 space-y-1">
                     <li>Total Monthly Obligations (Debt + Expenses): <strong>${(totals.debts + totals.expenses).toLocaleString()}</strong></li>
                     <li>Total Future Growth (Savings + Investments): <strong>${(totals.savings + totals.investments).toLocaleString()}</strong></li>
                   </ul>
                 </div>
               </div>
            </Card>
          </div>
        </div>

        {/* Input Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <CategorySection
            title="Debts"
            icon={TrendingDown}
            colorClass="text-rose-500 bg-rose-500"
            items={data.debts}
            onAdd={() => addItem('debts')}
            onUpdate={(id, f, v) => updateItem('debts', id, f, v)}
            onDelete={(id) => deleteItem('debts', id)}
          />
          
          <CategorySection
            title="Expenses"
            icon={DollarSign}
            colorClass="text-amber-500 bg-amber-500"
            items={data.expenses}
            onAdd={() => addItem('expenses')}
            onUpdate={(id, f, v) => updateItem('expenses', id, f, v)}
            onDelete={(id) => deleteItem('expenses', id)}
          />
          
          <CategorySection
            title="Savings"
            icon={Save}
            colorClass="text-blue-500 bg-blue-500"
            items={data.savings}
            onAdd={() => addItem('savings')}
            onUpdate={(id, f, v) => updateItem('savings', id, f, v)}
            onDelete={(id) => deleteItem('savings', id)}
          />
          
          <CategorySection
            title="Investments"
            icon={TrendingUp}
            colorClass="text-emerald-500 bg-emerald-500"
            items={data.investments}
            onAdd={() => addItem('investments')}
            onUpdate={(id, f, v) => updateItem('investments', id, f, v)}
            onDelete={(id) => deleteItem('investments', id)}
          />
        </div>

        <div className="text-center text-slate-400 text-sm py-8">
          <p>Data is saved automatically to your local browser.</p>
        </div>

      </div>
    </div>
  );
}
