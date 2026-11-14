'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import DateFilterBar from './DateFilterBar';
import { exportToExcel, exportToCsv } from '@/lib/excelUtils';
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
  Download,
  FileSpreadsheet,
  LayoutGrid
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
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const currency = '৳';
  const todayStr = new Date().toISOString().split('T')[0];

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
  const totalAsking = filteredClients.reduce((sum, c) => sum + (Number(c.askingCost) || 0), 0);
  const totalWon = filteredClients.reduce((sum, c) => sum + (Number(c.wonCost) || 0), 0);
  const totalPaid = filteredClients.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalWon - totalPaid);

  const handleOpenWhatsApp = (phone, name, business) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const template = 'Hi {name}! Checking in regarding project milestones for {business}. Let me know if you need any updates today.';
    const text = template
      .replace('{name}', name || 'Client')
      .replace('{business}', business || 'your business');

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportExcel = () => {
    const exportData = filteredClients.map((c, index) => ({
      'SL': index + 1,
      'Date': c.startDate || todayStr,
      'Client Name': c.clientName || '',
      'Business Name': c.businessName || '',
      'Phone': c.phone || '',
      'Email': c.email || '',
      'Services': (c.services || []).join(', '),
      'Asking Cost (BDT)': Number(c.askingCost) || 0,
      'Won Cost (BDT)': Number(c.wonCost) || 0,
      'Paid Amount (BDT)': Number(c.paidAmount) || 0,
      'Due Balance (BDT)': Math.max(0, (Number(c.wonCost) || 0) - (Number(c.paidAmount) || 0)),
      'Payment Status': c.paymentStatus || 'Pending',
      'Client Status': c.clientStatus || 'Active',
      'Contract': c.contractDuration || '',
      'Delivery Date': c.deliveryDate || ''
    }));

    exportToExcel(exportData, `Onboarded_Clients_${todayStr}.xlsx`, 'Clients');
  };

  const handleExportCsvFile = () => {
    const exportData = filteredClients.map((c, index) => ({
      'SL': index + 1,
      'Date': c.startDate || todayStr,
      'Client Name': c.clientName || '',
      'Business Name': c.businessName || '',
      'Phone': c.phone || '',
      'Email': c.email || '',
      'Services': (c.services || []).join(', '),
      'Asking Cost (BDT)': Number(c.askingCost) || 0,
      'Won Cost (BDT)': Number(c.wonCost) || 0,
      'Paid Amount (BDT)': Number(c.paidAmount) || 0,
      'Due Balance (BDT)': Math.max(0, (Number(c.wonCost) || 0) - (Number(c.paidAmount) || 0)),
      'Payment Status': c.paymentStatus || 'Pending',
      'Client Status': c.clientStatus || 'Active'
    }));

    exportToCsv(exportData, `Onboarded_Clients_${todayStr}.csv`);
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Paid in Full</span>;
      case 'Partial':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Partial Deposit</span>;
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Pending</span>;
      case 'Overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse">Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  const getProjectStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Retainer':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">{status}</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{status}</span>;
      case 'Onboarding':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">{status}</span>;
      case 'Delivered':
      case 'Completed':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
      case 'On Hold':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Date Filter Bar */}
      <DateFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            <span>Onboarded Clients & Deal Revenue</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {filteredClients.length} Clients
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control asking price vs won deal price in BDT (৳), payments, delivery milestones and client retention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Table / Cards */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
              title="Table View"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'}`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 transition-colors border border-purple-200 dark:border-purple-800"
            title="Download Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsvFile}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* New Client */}
          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Client Onboard</span>
          </button>
        </div>
      </div>

      {/* Accurate Financial Health Snapshot Cards (in BDT ৳) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Asking Quoted</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {currency} {totalAsking.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Initial proposal estimates</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Won Deal Value</span>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {currency} {totalWon.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Final agreed contract value</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Collected</span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {currency} {totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Received in bank / Mobile banking</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due / Outstanding Balance</span>
          <div className="text-xl font-extrabold text-amber-500 mt-1">
            {currency} {totalOutstanding.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">To be collected upon milestones</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name, business, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid in Full</option>
            <option value="Partial">Partial Deposit</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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

      {/* View Mode: Table View (Excel Style) */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[650px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3.5 w-10 text-center">SL</th>
                  <th className="py-3 px-4 min-w-[170px]">Client & Business</th>
                  <th className="py-3 px-4 min-w-[140px]">WhatsApp Phone</th>
                  <th className="py-3 px-4 min-w-[160px]">Services</th>
                  <th className="py-3 px-4 min-w-[120px]">Asking (৳)</th>
                  <th className="py-3 px-4 min-w-[120px]">Won Price (৳)</th>
                  <th className="py-3 px-4 min-w-[120px]">Paid (৳)</th>
                  <th className="py-3 px-4 min-w-[120px]">Due (৳)</th>
                  <th className="py-3 px-4 min-w-[120px]">Payment</th>
                  <th className="py-3 px-4 min-w-[120px]">Status</th>
                  <th className="py-3 px-4 text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Briefcase className="w-10 h-10 mx-auto opacity-50 text-purple-500" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Onboarded Clients</h4>
                        <p className="text-xs text-slate-500">
                          Click &quot;New Client Onboard&quot; or convert an inbound WhatsApp lead into a client.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client, index) => {
                    const asking = Number(client.askingCost) || 0;
                    const won = Number(client.wonCost) || 0;
                    const paid = Number(client.paidAmount) || 0;
                    const balance = Math.max(0, won - paid);

                    return (
                      <tr key={client._id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {client.businessName || client.clientName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {client.clientName} {client.email && `• ${client.email}`}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <button
                            onClick={() => handleOpenWhatsApp(client.phone, client.clientName, client.businessName)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>{client.phone}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {(client.services || []).map((srv) => (
                              <span key={srv} className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                                {srv}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400 line-through">
                          {currency} {asking.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {currency} {won.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {currency} {paid.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={balance > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                            {currency} {balance.toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {getPaymentBadge(client.paymentStatus)}
                        </td>

                        <td className="py-3 px-4">
                          {getProjectStatusBadge(client.clientStatus)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                setIsClientModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Client"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Delete client "${client.clientName}"?`)) {
                                  removeClient(client._id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60"
                              title="Delete Client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode: Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const asking = Number(client.askingCost) || 0;
            const won = Number(client.wonCost) || 0;
            const paid = Number(client.paidAmount) || 0;
            const balance = Math.max(0, won - paid);

            return (
              <div
                key={client._id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {client.businessName || client.clientName}
                      </h3>
                      <p className="text-xs text-slate-500">Contact: {client.clientName}</p>
                    </div>
                    {getProjectStatusBadge(client.clientStatus)}
                  </div>

                  <button
                    onClick={() => handleOpenWhatsApp(client.phone, client.clientName, client.businessName)}
                    className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>{client.phone}</span>
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asking Cost:</span>
                    <span className="line-through text-slate-400">{currency} {asking.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm">
                    <span>Won Deal Price:</span>
                    <span className="text-purple-600 dark:text-purple-400">{currency} {won.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Cash Collected:</span>
                    <span className="font-bold text-emerald-600">{currency} {paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Balance:</span>
                    <span className={`font-bold ${balance > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{currency} {balance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  {getPaymentBadge(client.paymentStatus)}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setIsClientModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete client "${client.clientName}"?`)) {
                          removeClient(client._id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
