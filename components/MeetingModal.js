'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  User, 
  Link2, 
  FileText, 
  X, 
  CheckCircle,
  MapPin
} from 'lucide-react';

export default function MeetingModal() {
  const { 
    isMeetingModalOpen, 
    setIsMeetingModalOpen, 
    editingMeeting, 
    setEditingMeeting, 
    saveMeeting,
    currentUser 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '',
    clientName: '',
    phone: '',
    meetingDate: todayStr,
    meetingTime: '03:00 PM',
    platform: 'Google Meet',
    meetingLink: '',
    agenda: '',
    status: 'Scheduled',
    notes: '',
    leadType: 'WhatsApp'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingMeeting) {
      setForm({
        title: editingMeeting.title || '',
        clientName: editingMeeting.clientName || '',
        phone: editingMeeting.phone || '',
        meetingDate: editingMeeting.meetingDate || todayStr,
        meetingTime: editingMeeting.meetingTime || '03:00 PM',
        platform: editingMeeting.platform || 'Google Meet',
        meetingLink: editingMeeting.meetingLink || '',
        agenda: editingMeeting.agenda || '',
        status: editingMeeting.status || 'Scheduled',
        notes: editingMeeting.notes || '',
        leadType: editingMeeting.leadType || 'WhatsApp'
      });
    } else {
      setForm({
        title: 'Project Discovery & Proposal Call',
        clientName: '',
        phone: '',
        meetingDate: todayStr,
        meetingTime: '03:00 PM',
        platform: 'Google Meet',
        meetingLink: '',
        agenda: 'Review client requirements, present agency portfolio, discuss scope & budget.',
        status: 'Scheduled',
        notes: '',
        leadType: 'WhatsApp'
      });
    }
  }, [editingMeeting, todayStr]);

  if (!isMeetingModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.clientName.trim() || !form.meetingDate) {
      alert('Please fill in Title, Client Name, and Date.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        createdBy: currentUser?.name || 'Sales Team'
      };
      if (editingMeeting?._id) payload._id = editingMeeting._id;

      await saveMeeting(payload);
      setIsMeetingModalOpen(false);
      setEditingMeeting(null);
    } catch (err) {
      alert('Error saving meeting: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingMeeting?._id ? 'Edit Scheduled Meeting' : 'Schedule Client Meeting'}
              </h3>
              <p className="text-xs text-slate-500">
                Book calls, demos, or discovery sessions with clients.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsMeetingModalOpen(false);
              setEditingMeeting(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Meeting Title */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Meeting Purpose / Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Website Demo & Requirement Discussion"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Client & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Client / Lead Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="e.g. Robin Khan"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Phone / WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 01787430525"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Date *
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={form.meetingDate}
                  onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Time
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={form.meetingTime}
                  onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
                  placeholder="e.g. 04:30 PM"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Platform & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Platform / Channel
              </label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Google Meet">🎥 Google Meet</option>
                <option value="Zoom">💻 Zoom Meeting</option>
                <option value="WhatsApp Call">📞 WhatsApp Call</option>
                <option value="Phone Call">📱 Direct Phone Call</option>
                <option value="In-Person">🏢 In-Person Office Visit</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Scheduled">⏳ Scheduled</option>
                <option value="Completed">✅ Completed</option>
                <option value="Rescheduled">🔄 Rescheduled</option>
                <option value="Cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>

          {/* Meeting Link or Location */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Meeting Link or Location
            </label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/xyz-abc or Zoom Link"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Agenda */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Agenda & Key Points
            </label>
            <textarea
              rows={2}
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="What to discuss, client requirements, pricing range..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsMeetingModalOpen(false);
                setEditingMeeting(null);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              {isSaving ? 'Saving...' : editingMeeting?._id ? 'Update Meeting' : 'Schedule Meeting'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

