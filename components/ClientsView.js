'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Send,
  Calendar,
  Layers,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function ClientsView() {
  const { 
    clients, 
    settings, 
    setIsClientModalOpen, 
    setEditingClient, 
    removeClient 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const currency = settings.currencySymbol || '$';

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          c.clientName?.toLowerCase().includes(q) ||
          c.businessName?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterPayment !== 'All' && c.paymentStatus !== filterPayment) {
        return false;
      }

      if (filterStatus !== 'All' && c.clientStatus !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [clients, search, filterPayment, filterStatus]);

  // Aggregate stats
  const totalAsking = clients.reduce((sum, c) => sum + (Number(c.askingCost) || 0), 0);
  const totalWon = clients.reduce((sum, c) => sum + (Number(c.wonCost) || 0), 0);
  const totalPaid = clients.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalWon - totalPaid);

  const handleOpenWhatsApp = (phone, name, business) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const template = 'Hi {name}! Checking in regarding project milestones for {business}. Let me know if you need any updates today.';
    const text = template
      .replace('{name}', name || 'Client')
      .replace('{business}', business || 'your business');

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Paid in Full</span>;
      case 'Partial':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Partial Deposit</span>;
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Payment Pending</span>;
      case 'Overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse">Payment Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  const getProjectStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Retainer':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">{status}</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{status}</span>;
      case 'Onboarding':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">{status}</span>;
      case 'Delivered':
      case 'Completed':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
      case 'On Hold':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & New Client */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            <span>Onboarded Clients & Deal Revenue</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {clients.length} Clients
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control asking cost vs won cost, payment status, active services, delivery milestones, and client retention.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClient(null);
            setIsClientModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Onboard</span>
        </button>
      </div>

      {/* Financial Health Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Asking Quoted</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {currency}{totalAsking.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Initial proposal estimates</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Won Deal Value</span>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {currency}{totalWon.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Final agreed contract value</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Cash Collected</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {currency}{totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Cleared in bank / Stripe</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
          <div className="text-xl font-bold text-amber-500 mt-1">
            {currency}{totalOutstanding.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">To be collected upon milestones</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, business name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Payment Status */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid in Full</option>
            <option value="Partial">Partial Deposit</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          {/* Project Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Client Statuses</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Delivered">Delivered</option>
            <option value="Retainer">Monthly Retainer</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No onboarded clients match</h3>
            <p className="text-xs text-slate-500 mt-1">Convert a hot lead or click &quot;New Client Onboard&quot; to add one.</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const asking = Number(client.askingCost) || 0;
            const won = Number(client.wonCost) || 0;
            const paid = Number(client.paidAmount) || 0;
            const balance = Math.max(0, won - paid);
            const discount = asking > won ? asking - won : 0;

            return (
              <div
                key={client._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header: Business & Client Name */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {client.businessName || client.clientName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Contact: <strong className="text-slate-700 dark:text-slate-300">{client.clientName}</strong>
                      </p>
                    </div>
                    {getProjectStatusBadge(client.clientStatus)}
                  </div>

                  {/* Phone with WhatsApp link */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => handleOpenWhatsApp(client.phone, client.clientName, client.businessName)}
                      className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Phone className="w-3 h-3 text-emerald-500" />
                      <span>{client.phone}</span>
                    </button>
                    {client.email && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        • {client.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Services Pills */}
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {(client.services || []).map((srv) => (
                      <span
                        key={srv}
                        className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financials Block: Asking Cost vs Won Cost */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Asking Quoted Cost:</span>
                    <span className="font-semibold text-slate-500 line-through">
                      {currency}{asking.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                    <span>Won Deal Price:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold">
                      {currency}{won.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Negotiated discount: {currency}{discount.toLocaleString()} ({Math.round((discount / asking) * 100)}%)
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Payment:</span>
                      {getPaymentBadge(client.paymentStatus)}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Balance Due:</span>
                      <span className={`text-xs font-bold ${balance > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {currency}{balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes & Dates */}
                {client.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                    &quot;{client.notes}&quot;
                  </p>
                )}

                {/* Footer Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400">
                    {client.contractDuration || 'Monthly'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenWhatsApp(client.phone, client.clientName, client.businessName)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 transition-colors flex items-center gap-1"
                      title="WhatsApp Client"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setIsClientModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Client"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete client "${client.clientName}"?`)) {
                          removeClient(client._id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

