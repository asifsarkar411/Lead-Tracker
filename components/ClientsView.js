'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import DateFilterBar from './DateFilterBar';
import { exportToExcel, exportToCsv, parseExcelOrCsvFile } from '@/lib/excelUtils';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Send,
  Calendar,
  Layers,
  Download,
  Upload,
  FileSpreadsheet,
  LayoutGrid
} from 'lucide-react';

export default function ClientsView() {
  const { 
    clients, 
    settings, 
    setIsClientModalOpen, 
    setEditingClient, 
    removeClient,
    importClientsBatch
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

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
          c.email?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q);
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

  // Aggregate stats (strictly in BDT ৳)
  const totalAsking = filteredClients.reduce((sum, c) => sum + (Number(c.askingCost) || 0), 0);
  const totalWon = filteredClients.reduce((sum, c) => sum + (Number(c.wonCost) || 0), 0);
  const totalPaid = filteredClients.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalWon - totalPaid);

  const handleOpenWhatsApp = (phone, name, business) => {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const template = 'Hi {name}! Checking in regarding project milestones for {business}. Let me know if you need any updates today.';
    const text = template
      .replace('{name}', name || 'Client')
      .replace('{business}', business || 'your business');

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      alert('No numeric phone number found for WhatsApp direct launcher.');
    }
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
      'Asking Cost (BDT ৳)': Number(c.askingCost) || 0,
      'Won Cost (BDT ৳)': Number(c.wonCost) || 0,
      'Paid Amount (BDT ৳)': Number(c.paidAmount) || 0,
      'Due Balance (BDT ৳)': Math.max(0, (Number(c.wonCost) || 0) - (Number(c.paidAmount) || 0)),
      'Payment Status': c.paymentStatus || 'Pending',
      'Client Status': c.clientStatus || 'Active',
      'Contract': c.contractDuration || '',
      'Delivery Date': c.deliveryDate || '',
      'Notes': c.notes || ''
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
      'Asking Cost (BDT ৳)': Number(c.askingCost) || 0,
      'Won Cost (BDT ৳)': Number(c.wonCost) || 0,
      'Paid Amount (BDT ৳)': Number(c.paidAmount) || 0,
      'Due Balance (BDT ৳)': Math.max(0, (Number(c.wonCost) || 0) - (Number(c.paidAmount) || 0)),
      'Payment Status': c.paymentStatus || 'Pending',
      'Client Status': c.clientStatus || 'Active'
    }));

    exportToCsv(exportData, `Onboarded_Clients_${todayStr}.csv`);
  };

  // Import handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelOrCsvFile(file, 'onboard');
      if (!parsed || parsed.length === 0) {
        alert('No valid clients found in file.');
        return;
      }
      setImportPreview(parsed);
    } catch (err) {
      alert('Error parsing file: ' + err.message);
    }
  };

  const handleSaveImportedBatch = async () => {
    if (importPreview.length === 0) return;
    setIsSavingBatch(true);
    try {
      await importClientsBatch(importPreview);
      setIsImportModalOpen(false);
      setImportPreview([]);
    } catch (err) {
      alert('Error saving batch: ' + err.message);
    } finally {
      setIsSavingBatch(false);
    }
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

          {/* Import Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel</span>
          </button>

          {/* New Client */}
          <button
            onClick={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
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
                          Click &quot;New Client Onboard&quot; or &quot;Import Excel&quot; to load client accounts.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client, index) => {
                    const asking = Number(client.askingCost) || 0;
                    const won = Number(client.wonCost) || 0;
                    const paid = Number(client.paidAmount) || 0;
                    const due = Math.max(0, won - paid);

                    return (
                      <tr 
                        key={client._id}
                        className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {client.clientName}
                          </div>
                          {client.businessName && client.businessName !== client.clientName && (
                            <div className="text-[11px] text-slate-500">
                              {client.businessName}
                            </div>
                          )}
                          {client.email && (
                            <div className="text-[10px] text-slate-400">
                              {client.email}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {client.phone ? (
                            <button
                              onClick={() => handleOpenWhatsApp(client.phone, client.clientName, client.businessName)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-500" />
                              <span>{client.phone}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">No phone</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[170px]">
                            {(client.services || []).map((srv) => (
                              <span
                                key={srv}
                                className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-500">
                          {asking > 0 ? `${currency} ${asking.toLocaleString()}` : '-'}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {won > 0 ? `${currency} ${won.toLocaleString()}` : '-'}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {paid > 0 ? `${currency} ${paid.toLocaleString()}` : `${currency} 0`}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-amber-500">
                          {due > 0 ? `${currency} ${due.toLocaleString()}` : <span className="text-emerald-500">Cleared ✓</span>}
                        </td>

                        <td className="py-3 px-4">
                          {getPaymentBadge(client.paymentStatus)}
                        </td>

                        <td className="py-3 px-4">
                          {getProjectStatusBadge(client.clientStatus)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                setIsClientModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Client"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete client record for "${client.clientName}"?`)) {
                                  removeClient(client._id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete Client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const won = Number(client.wonCost) || 0;
            const paid = Number(client.paidAmount) || 0;
            const due = Math.max(0, won - paid);

            return (
              <div
                key={client._id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {client.clientName}
                    </h3>
                    <p className="text-xs text-slate-500">{client.businessName || 'Independent Deal'}</p>
                  </div>
                  {getProjectStatusBadge(client.clientStatus)}
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-mono text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Deal (৳)</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{won.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Paid (৳)</span>
                    <span className="text-xs font-bold text-emerald-600">{paid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Due (৳)</span>
                    <span className="text-xs font-bold text-amber-500">{due.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  {client.phone ? (
                    <button
                      onClick={() => handleOpenWhatsApp(client.phone, client.clientName, client.businessName)}
                      className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.phone}</span>
                    </button>
                  ) : <span className="text-slate-400">No phone</span>}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setIsClientModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeClient(client._id)}
                      className="p-1.5 text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-500" />
                <span>Import Onboard Clients Sheet</span>
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-purple-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                id="onboard-file-upload"
                className="hidden"
              />
              <label htmlFor="onboard-file-upload" className="cursor-pointer space-y-2 block">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-purple-500" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Excel file with &quot;Onboard&quot; sheet or CSV
                </div>
                <div className="text-[11px] text-slate-400">
                  Supports columns like Name, amount own, Details, asking price, etc.
                </div>
              </label>
            </div>

            {importPreview.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Found {importPreview.length} clients to import:
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs p-2">
                  {importPreview.map((c, i) => (
                    <div key={i} className="py-1.5 flex justify-between">
                      <span className="font-bold">{c.clientName} ({c.businessName})</span>
                      <span className="font-mono text-purple-600">৳{c.wonCost?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImportedBatch}
                disabled={importPreview.length === 0 || isSavingBatch}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
              >
                {isSavingBatch ? 'Saving...' : `Import ${importPreview.length} Clients`}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
