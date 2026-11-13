'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Save, 
  Plus, 
  Clock, 
  Calendar, 
  Flame, 
  Phone, 
  Send, 
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LeadModal() {
  const { 
    isLeadModalOpen, 
    setIsLeadModalOpen, 
    editingLead, 
    saveLead, 
    settings 
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    requirements: '',
    services: [],
    potentialityStatus: 'Warm',
    proposalSentStatus: 'Not Sent',
    estimatedBudget: 0,
    followUpDate: '',
    followUpTime: '11:00',
    generalNotes: '',
    followUpNotes: [],
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteOutcome, setNewNoteOutcome] = useState('Connected');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingLead) {
      setFormData({
        ...editingLead,
        services: editingLead.services || [],
        followUpNotes: editingLead.followUpNotes || [],
        followUpDate: editingLead.followUpDate || '',
        followUpTime: editingLead.followUpTime || '11:00',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        requirements: '',
        services: ['Website Development'],
        potentialityStatus: 'Warm',
        proposalSentStatus: 'Not Sent',
        estimatedBudget: 1000,
        followUpDate: new Date().toISOString().split('T')[0],
        followUpTime: '11:00',
        generalNotes: '',
        followUpNotes: [],
      });
    }
    setNewNoteText('');
    setErrorMessage('');
  }, [editingLead, isLeadModalOpen]);

  if (!isLeadModalOpen) return null;

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

  const handleAddFollowUpNote = () => {
    if (!newNoteText.trim()) return;

    const newNoteObj = {
      _id: 'note_' + Date.now(),
      date: new Date().toISOString(),
      note: newNoteText.trim(),
      outcome: newNoteOutcome,
      addedAt: 'Just now',
    };

    setFormData((prev) => ({
      ...prev,
      followUpNotes: [...prev.followUpNotes, newNoteObj],
    }));

    setNewNoteText('');
  };

  const handleRemoveFollowUpNote = (noteId) => {
    setFormData((prev) => ({
      ...prev,
      followUpNotes: prev.followUpNotes.filter((n) => n._id !== noteId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage('Client Name and WhatsApp Phone Number are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // If user typed a note but didn't click "Add Note" button, add it automatically
    let notesToSave = [...formData.followUpNotes];
    if (newNoteText.trim()) {
      notesToSave.push({
        _id: 'note_' + Date.now(),
        date: new Date().toISOString(),
        note: newNoteText.trim(),
        outcome: newNoteOutcome,
        addedAt: 'Just now',
      });
    }

    const payload = {
      ...formData,
      followUpNotes: notesToSave,
    };

    const res = await saveLead(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsLeadModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Failed to save lead. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{editingLead ? 'Edit Inbound Lead & Notes' : 'New Inbound WhatsApp Lead'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                WhatsApp Channel
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save phone number, requirements, follow-up notices and timestamped logs.
            </p>
          </div>
          
          <button
            onClick={() => setIsLeadModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe / Rahim Chowdhury"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +8801712345678 or +14155552671"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Email (Optional)
              </label>
              <input
                type="email"
                placeholder="client@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Budget ({settings.currencySymbol || '$'})
              </label>
              <input
                type="number"
                min="0"
                placeholder="1500"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Section 2: Services Interested In */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Services Required / Discussed
            </label>
            <div className="flex flex-wrap gap-2">
              {(settings.services || []).map((srv) => {
                const isSelected = formData.services.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => handleServiceToggle(srv)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {srv}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Client Requirements */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client Requirements & Inquiries
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Needs e-commerce website redesign with custom checkout, SEO setup and Google Business Profile top 3 ranking in their city..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Section 4: Potentiality & Proposal Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Potentiality Status
              </label>
              <select
                value={formData.potentialityStatus}
                onChange={(e) => setFormData({ ...formData, potentialityStatus: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="Hot">🔥 Hot Deal (Ready to buy)</option>
                <option value="Warm">☀️ Warm (Interested, evaluating)</option>
                <option value="Cold">❄️ Cold (Price inquiry only)</option>
                <option value="Converted">🏆 Converted / Won</option>
                <option value="Lost">❌ Lost / Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proposal Sent Status
              </label>
              <select
                value={formData.proposalSentStatus}
                onChange={(e) => setFormData({ ...formData, proposalSentStatus: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="Not Sent">Not Sent</option>
                <option value="Drafted">Drafted (Preparing)</option>
                <option value="Sent">Sent to Client</option>
                <option value="Under Review">Under Client Review</option>
                <option value="Accepted">Accepted by Client</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Section 5: Follow-Up Date & Time Notice Picker */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Calendar className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Follow-up Notice & Reminder Alarm
              </h4>
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
              Set a date and time. The system will trigger notice alerts on this date so you never forget to follow up!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Preferred Time
                </label>
                <input
                  type="time"
                  value={formData.followUpTime}
                  onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* Quick date shortcuts */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const d = new Date().toISOString().split('T')[0];
                  setFormData({ ...formData, followUpDate: d });
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 hover:bg-amber-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                  setFormData({ ...formData, followUpDate: d });
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 hover:bg-amber-200"
              >
                Tomorrow (+1d)
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
                  setFormData({ ...formData, followUpDate: d });
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 hover:bg-amber-200"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                  setFormData({ ...formData, followUpDate: d });
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 hover:bg-amber-200"
              >
                Next Week (+7d)
              </button>
            </div>
          </div>

          {/* Section 6: Multiple Follow-up Notes & Log History */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-500" />
                Multiple Follow-up Notes History ({formData.followUpNotes.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Log note 1, note 2, etc. with outcomes
              </span>
            </div>

            {/* List of existing notes */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formData.followUpNotes.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No previous follow-up notes logged yet. Add your first follow-up note below!
                </p>
              ) : (
                formData.followUpNotes.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Follow-up #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.outcome || 'Connected'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {item.note}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFollowUpNote(item._id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Remove Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add new follow-up note input */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                + Add Another Follow-up Note:
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sent pricing breakdown on WhatsApp; client requested discount for upfront payment..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                
                <select
                  value={newNoteOutcome}
                  onChange={(e) => setNewNoteOutcome(e.target.value)}
                  className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Connected">Connected</option>
                  <option value="Sent Details">Sent Details</option>
                  <option value="Meeting Requested">Meeting Requested</option>
                  <option value="Positive">Positive</option>
                  <option value="Needs Recheck">Needs Recheck</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Not Interested">Not Interested</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddFollowUpNote}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>

          {/* Section 7: General Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              General Internal Notes
            </label>
            <textarea
              rows={2}
              placeholder="Any other details, competitor quotes, client personality..."
              value={formData.generalNotes}
              onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsLeadModalOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editingLead ? 'Save Lead Changes' : 'Create Inbound Lead'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

