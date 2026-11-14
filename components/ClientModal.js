'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Save, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  Percent,
  CheckCircle2
} from 'lucide-react';

export default function ClientModal() {
  const { 
    isClientModalOpen, 
    setIsClientModalOpen, 
    editingClient, 
    saveClient, 
    settings 
  } = useApp();

  const [formData, setFormData] = useState({
    clientName: '',
    businessName: '',
    phone: '',
    email: '',
    services: [],
    askingCost: '', // Strictly starts blank as requested
    wonCost: '',    // Strictly starts blank as requested
    paidAmount: '', // Strictly starts blank as requested
    paymentStatus: 'Pending',
    clientStatus: 'Active',
    contractDuration: 'Monthly Retainer',
    startDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currency = '৳';

  useEffect(() => {
    if (editingClient) {
      setFormData({
        ...editingClient,
        services: editingClient.services || [],
        askingCost: editingClient.askingCost !== undefined && editingClient.askingCost !== null ? String(editingClient.askingCost) : '',
        wonCost: editingClient.wonCost !== undefined && editingClient.wonCost !== null ? String(editingClient.wonCost) : '',
        paidAmount: editingClient.paidAmount !== undefined && editingClient.paidAmount !== null ? String(editingClient.paidAmount) : '',
        startDate: editingClient.startDate || new Date().toISOString().split('T')[0],
        deliveryDate: editingClient.deliveryDate || '',
      });
    } else {
      // Clean blank state for new client
      setFormData({
        clientName: '',
        businessName: '',
        phone: '',
        email: '',
        services: ['Website Development'],
        askingCost: '', // Blank
        wonCost: '',    // Blank
        paidAmount: '', // Blank
        paymentStatus: 'Pending',
        clientStatus: 'Active',
        contractDuration: 'Monthly Retainer',
        startDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        notes: '',
      });
    }
    setErrorMessage('');
  }, [editingClient, isClientModalOpen]);

  if (!isClientModalOpen) return null;

  const handleServiceToggle = (srv) => {
    setFormData((prev) => {
      const exists = prev.services.includes(srv);
      if (exists) {
        return { ...prev, services: prev.services.filter((s) => s !== srv) };
      } else {
        return { ...prev, services: [...prev.services, srv] };
      }
    });
  };

  // Accurate live calculations
  const numAsking = Number(formData.askingCost) || 0;
  const numWon = Number(formData.wonCost) || 0;
  const numPaid = Number(formData.paidAmount) || 0;
  const numDue = Math.max(0, numWon - numPaid);
  const numDiscount = numAsking > numWon && numAsking > 0 ? numAsking - numWon : 0;
  const discountPercent = numAsking > 0 ? Math.round((numDiscount / numAsking) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() && !formData.businessName.trim()) {
      setErrorMessage('Client Name or Business Name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Determine accurate payment status
    let calculatedPaymentStatus = formData.paymentStatus;
    if (numWon > 0) {
      if (numPaid >= numWon) {
        calculatedPaymentStatus = 'Paid';
      } else if (numPaid > 0) {
        calculatedPaymentStatus = 'Partial';
      } else {
        calculatedPaymentStatus = 'Pending';
      }
    }

    const payload = {
      ...formData,
      askingCost: numAsking,
      wonCost: numWon,
      paidAmount: numPaid,
      paymentStatus: calculatedPaymentStatus
    };

    const res = await saveClient(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsClientModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Failed to save client details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              <span>{editingClient?._id ? 'Edit Onboarded Client' : 'Onboard New Client'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage agreed services, deal pricing in BDT (৳), payments and project milestones.
            </p>
          </div>
          
          <button
            onClick={() => setIsClientModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Asif Mahmud"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company / Business Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tech Solution BD"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+8801700000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="client@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Services Engaged */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Services Engaged
            </label>
            <div className="flex flex-wrap gap-2">
              {(settings.services || []).map((srv) => {
                const isSelected = formData.services.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => handleServiceToggle(srv)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {srv}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Financial & Cost Controls with BLANK fields and ACCURATE live calculation */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-purple-600">৳</span>
              Financial Deal Controls (in BDT ৳)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Asking Cost */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Asking Cost ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter asking price..."
                  value={formData.askingCost}
                  onChange={(e) => setFormData({ ...formData, askingCost: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Won Deal Cost */}
              <div>
                <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">
                  Won Deal Cost ({currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter agreed won price..."
                  value={formData.wonCost}
                  onChange={(e) => setFormData({ ...formData, wonCost: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  Paid Amount ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter received amount..."
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Accurate Live Calculation Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Deal Price (Won):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currency} {numWon.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Cash Collected:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {currency} {numPaid.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Due Balance:</span>
                <span className={`font-bold ${numDue > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {currency} {numDue.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Discount Given:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {currency} {numDiscount.toLocaleString()} {discountPercent > 0 && `(${discountPercent}%)`}
                </span>
              </div>
            </div>

            {/* Payment & Client Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Pending">Pending Invoice</option>
                  <option value="Partial">Partial Deposit</option>
                  <option value="Paid">Paid in Full</option>
                  <option value="Overdue">Overdue Payment</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Project Status
                </label>
                <select
                  value={formData.clientStatus}
                  onChange={(e) => setFormData({ ...formData, clientStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
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
          </div>

          {/* Dates & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contract Type
              </label>
              <input
                type="text"
                placeholder="Monthly Retainer"
                value={formData.contractDuration}
                onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery / Renewal Date
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client & Project Notes
            </label>
            <textarea
              rows={2}
              placeholder="Deliverables, payment methods (bKash/Nagad/Bank), project timeline..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline mr-1" />
              <span>{isSubmitting ? 'Saving...' : editingClient?._id ? 'Save Client Updates' : 'Onboard Client'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
