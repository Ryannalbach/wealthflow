import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, DollarSign, PieChart, TrendingUp, TrendingDown, 
  Wallet, AlertCircle, Save, Calculator, Home, Calendar, ArrowRight
} from 'lucide-react';

// --- Shared UI Components ---

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
    {total !== undefined && (
      <span className="font-bold text-slate-700">
        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    )}
  </div>
);

// --- Sub-Feature: Budget Dashboard (Original App) ---

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
          const strokeDasharray = `${percent * 314} 314`; 
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

const initialBudget_Data = {
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

const BudgetDashboard = () => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthflow_data');
      return saved ? JSON.parse(saved) : initialBudget_Data;
    } catch (e) {
      return initialBudget_Data;
    }
  });

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
    { label: 'Debts', value: totals.debts, color: '#f43f5e' },
    { label: 'Expenses', value: totals.expenses, color: '#f59e0b' },
    { label: 'Savings', value: totals.savings, color: '#3b82f6' },
    { label: 'Investments', value: totals.investments, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monthly Budget</h2>
          <p className="text-slate-500 text-sm">Track your income and outflows.</p>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                   <li>Total Monthly Obligations: <strong>${(totals.debts + totals.expenses).toLocaleString()}</strong></li>
                   <li>Total Future Growth: <strong>${(totals.savings + totals.investments).toLocaleString()}</strong></li>
                 </ul>
               </div>
             </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <CategorySection title="Debts" icon={TrendingDown} colorClass="text-rose-500 bg-rose-500" items={data.debts} onAdd={() => addItem('debts')} onUpdate={(id, f, v) => updateItem('debts', id, f, v)} onDelete={(id) => deleteItem('debts', id)} />
        <CategorySection title="Expenses" icon={DollarSign} colorClass="text-amber-500 bg-amber-500" items={data.expenses} onAdd={() => addItem('expenses')} onUpdate={(id, f, v) => updateItem('expenses', id, f, v)} onDelete={(id) => deleteItem('expenses', id)} />
        <CategorySection title="Savings" icon={Save} colorClass="text-blue-500 bg-blue-500" items={data.savings} onAdd={() => addItem('savings')} onUpdate={(id, f, v) => updateItem('savings', id, f, v)} onDelete={(id) => deleteItem('savings', id)} />
        <CategorySection title="Investments" icon={TrendingUp} colorClass="text-emerald-500 bg-emerald-500" items={data.investments} onAdd={() => addItem('investments')} onUpdate={(id, f, v) => updateItem('investments', id, f, v)} onDelete={(id) => deleteItem('investments', id)} />
      </div>
    </div>
  );
};

// --- Sub-Feature: Investment Calculator ---

const InvestmentCalculator = () => {
  const [values, setValues] = useState({
    initial: 5000,
    monthly: 500,
    rate: 7,
    years: 20
  });

  const results = useMemo(() => {
    const r = values.rate / 100 / 12;
    const n = values.years * 12;
    
    // Future Value of Initial: P * (1+r)^n
    const fvInitial = values.initial * Math.pow(1 + r, n);
    
    // Future Value of Contributions: PMT * ((1+r)^n - 1) / r
    const fvContribs = r === 0 
      ? values.monthly * n 
      : values.monthly * (Math.pow(1 + r, n) - 1) / r;
      
    const total = fvInitial + fvContribs;
    const totalInvested = values.initial + (values.monthly * n);
    const interest = total - totalInvested;

    return { total, totalInvested, interest };
  }, [values]);

  const InputField = ({ label, value, field, prefix = null, suffix = null }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => setValues(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
          className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Investment Projection</h2>
          <p className="text-slate-500 text-sm">Compound interest calculator.</p>
        </div>
        <Card className="p-6 space-y-4">
          <InputField label="Initial Principal" value={values.initial} field="initial" prefix="$" />
          <InputField label="Monthly Contribution" value={values.monthly} field="monthly" prefix="$" />
          <InputField label="Annual Return Rate" value={values.rate} field="rate" suffix="%" />
          <InputField label="Time Period (Years)" value={values.years} field="years" />
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-8 h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Value</span>
              <div className="text-3xl font-bold text-emerald-800 mt-1">
                ${Math.round(results.total).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Principal Invested</span>
              <div className="text-2xl font-bold text-blue-800 mt-1">
                ${Math.round(results.totalInvested).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Interest Earned</span>
              <div className="text-2xl font-bold text-purple-800 mt-1">
                ${Math.round(results.interest).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-6 flex flex-col justify-between flex-1">
            <h4 className="font-semibold text-slate-700 mb-4">Growth Breakdown</h4>
            <div className="flex-1 flex items-end gap-2 h-48 w-full">
              {/* Simple visual bar chart using flex */}
              <div className="w-1/2 flex flex-col justify-end h-full">
                 <div className="bg-blue-500 rounded-t-lg w-full transition-all duration-700" style={{ height: `${(results.totalInvested / results.total) * 100}%` }}></div>
                 <span className="text-xs text-center mt-2 font-medium text-slate-500">Principal</span>
              </div>
              <div className="w-1/2 flex flex-col justify-end h-full">
                 <div className="bg-emerald-500 rounded-t-lg w-full transition-all duration-700" style={{ height: '100%' }}></div>
                 <span className="text-xs text-center mt-2 font-medium text-slate-500">Total with Interest</span>
              </div>
            </div>
            <div className="mt-6 text-sm text-slate-500 text-center">
              Over {values.years} years, your money multiplied by <strong>{(results.total / results.totalInvested).toFixed(2)}x</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Sub-Feature: Mortgage Calculator ---

const MortgageCalculator = () => {
  const [values, setValues] = useState({
    price: 350000,
    downPayment: 70000,
    rate: 6.5,
    years: 30
  });
  const [useCustomPayment, setUseCustomPayment] = useState(false);
  const [customPayment, setCustomPayment] = useState(null);

  const results = useMemo(() => {
    const principal = values.price - values.downPayment;
    const r = values.rate / 100 / 12;
    const n = values.years * 12;
    
    // Mortgage Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
    let monthlyPayment = r === 0 
      ? principal / n 
      : principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    // Override with custom payment if enabled
    if (useCustomPayment && customPayment) {
      monthlyPayment = customPayment;
    }
      
    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - principal;
    
    // Payoff Date
    const today = new Date();
    const payoffDate = new Date(today.setMonth(today.getMonth() + n));

    return { monthlyPayment, totalInterest, totalPaid, principal, payoffDate };
  }, [values, useCustomPayment, customPayment]);

  const InputField = ({ label, value, field, prefix = null, suffix = null }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => setValues(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
          className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mortgage Planner</h2>
          <p className="text-slate-500 text-sm">Estimate monthly payments.</p>
        </div>
        <Card className="p-6 space-y-4">
          <InputField label="Home Price" value={values.price} field="price" prefix="$" />
          <InputField label="Down Payment" value={values.downPayment} field="downPayment" prefix="$" />
          <div className="p-3 bg-blue-50 rounded text-xs text-blue-700 flex justify-between">
            <span>Loan Principal:</span>
            <strong>${(values.price - values.downPayment).toLocaleString()}</strong>
          </div>
          <InputField label="Interest Rate (APR)" value={values.rate} field="rate" suffix="%" />
          <InputField label="Loan Term (Years)" value={values.years} field="years" />
          
          <div className="border-t border-slate-200 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomPayment}
                onChange={(e) => setUseCustomPayment(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-700">Use Custom Monthly Payment</span>
            </label>
            {useCustomPayment && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Custom Monthly Payment</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input
                    type="number"
                    value={customPayment || ''}
                    onChange={(e) => setCustomPayment(parseFloat(e.target.value) || null)}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Card className="p-6 bg-slate-800 text-white border-none flex flex-col justify-center items-center text-center">
             <span className="text-sm opacity-70 uppercase tracking-wider mb-2">Estimated Monthly Payment</span>
             <div className="text-4xl font-bold">
               ${Math.round(results.monthlyPayment).toLocaleString()}
             </div>
             <div className="text-xs opacity-50 mt-2">(Principal & Interest Only)</div>
           </Card>

           <Card className="p-6 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Calendar size={14} /> Payoff Date
              </span>
              <div className="text-xl font-bold text-slate-800">
                {results.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Total Interest: <span className="text-rose-500">${Math.round(results.totalInterest).toLocaleString()}</span>
              </div>
           </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <h4 className="font-semibold text-slate-700 mb-6">Monthly Payment Breakdown</h4>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Principal Payment</span>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                ${Math.round(results.monthlyPayment * (results.principal / results.totalPaid)).toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest Payment</span>
              <div className="text-2xl font-bold text-rose-500 mt-2">
                ${Math.round(results.monthlyPayment * (results.totalInterest / results.totalPaid)).toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Monthly</span>
              <div className="text-2xl font-bold text-slate-800 mt-2">
                ${Math.round(results.monthlyPayment).toLocaleString()}
              </div>
            </div>
          </div>
          
          <h5 className="font-semibold text-slate-700 mb-3 text-sm">Total Breakdown Over {values.years} Years</h5>
          <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${(results.principal / results.totalPaid) * 100}%` }}
              title="Principal"
            ></div>
            <div 
              className="h-full bg-rose-400" 
              style={{ width: `${(results.totalInterest / results.totalPaid) * 100}%` }}
              title="Interest"
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-3">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-500"></div>
               <span className="text-slate-600">Total Principal: <strong>${Math.round(results.principal).toLocaleString()}</strong></span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-rose-400"></div>
               <span className="text-slate-600">Total Interest: <strong>${Math.round(results.totalInterest).toLocaleString()}</strong></span>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Component (Navigation Wrapper) ---

export default function WealthFlowCalculator() {
  const [activeTab, setActiveTab] = useState('budget');

  const NavButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-lg text-white">
              <Wallet size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">WealthFlow</h1>
          </div>
          
          <nav className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl backdrop-blur-sm overflow-x-auto">
            <NavButton id="budget" label="Budget" icon={PieChart} />
            <NavButton id="investment" label="Investments" icon={TrendingUp} />
            <NavButton id="mortgage" label="Mortgage" icon={Home} />
          </nav>
        </header>

        {/* Content Area */}
        <main>
          {activeTab === 'budget' && <BudgetDashboard />}
          {activeTab === 'investment' && <InvestmentCalculator />}
          {activeTab === 'mortgage' && <MortgageCalculator />}
        </main>

        <footer className="text-center text-slate-400 text-sm py-8 border-t border-slate-200 mt-12">
          <p>© 2024 WealthFlow. Your data is stored locally.</p>
        </footer>

      </div>
    </div>
  );
}