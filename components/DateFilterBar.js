'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';

export default function DateFilterBar() {
  const { dateFilter, setDateFilter } = useApp();

  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const todayStr = new Date().toISOString().split('T')[0];

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = ['2024', '2025', '2026', '2027', '2028'];

  const handleSelectQuickFilter = (type) => {
    if (type === 'all') {
      setDateFilter({ type: 'all', date: '', month: '', year: '' });
    } else if (type === 'today') {
      setDateFilter({ type: 'today', date: todayStr, month: '', year: '' });
    } else if (type === 'this-month') {
      setDateFilter({ 
        type: 'month', 
        date: '', 
        month: `${currentYear}-${currentMonth}`, 
        year: currentYear 
      });
    }
  };

  const isFiltered = dateFilter.type !== 'all';

  return (
    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
      
      {/* Left: Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          Filter:
        </span>

        <button
          onClick={() => handleSelectQuickFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            dateFilter.type === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Time
        </button>

        <button
          onClick={() => handleSelectQuickFilter('today')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            dateFilter.type === 'today'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Today
        </button>

        <button
          onClick={() => handleSelectQuickFilter('this-month')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            dateFilter.type === 'month' && dateFilter.month === `${currentYear}-${currentMonth}`
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          This Month
        </button>
      </div>

      {/* Right: Dynamic Specific Date, Month & Year Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Specific Date Picker */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400">Date:</span>
          <input
            type="date"
            value={dateFilter.type === 'specific' ? dateFilter.date : ''}
            onChange={(e) => {
              if (e.target.value) {
                setDateFilter({ type: 'specific', date: e.target.value, month: '', year: '' });
              } else {
                handleSelectQuickFilter('all');
              }
            }}
            className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
          />
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400">Month:</span>
          <select
            value={dateFilter.type === 'month' ? dateFilter.month.split('-')[1] || dateFilter.month : ''}
            onChange={(e) => {
              const m = e.target.value;
              if (m) {
                const yr = dateFilter.year || currentYear;
                setDateFilter({ type: 'month', date: '', month: `${yr}-${m}`, year: yr });
              } else {
                handleSelectQuickFilter('all');
              }
            }}
            className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400">Year:</span>
          <select
            value={dateFilter.type === 'year' ? dateFilter.year : ''}
            onChange={(e) => {
              const y = e.target.value;
              if (y) {
                setDateFilter({ type: 'year', date: '', month: '', year: y });
              } else {
                handleSelectQuickFilter('all');
              }
            }}
            className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={() => handleSelectQuickFilter('all')}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear Date Filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
