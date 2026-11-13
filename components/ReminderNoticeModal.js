'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  BellRing, 
  Clock, 
  Calendar, 
  Phone, 
  Send, 
  Check, 
  Plus, 
  Volume2, 
  AlertCircle,
  Flame,
  FileText
} from 'lucide-react';

export default function ReminderNoticeModal() {
  const { 
    isReminderModalOpen, 
    setIsReminderModalOpen, 
    leads, 
    saveLead, 
    outreachLeads, 
    saveOutreachLead, 
    settings,
    playNotificationChime
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'overdue', 'today', 'upcoming'
  const [quickNoteMap, setQuickNoteMap] = useState({});

  if (!isReminderModalOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Inbound WhatsApp Leads with dates
  const overdueInbound = leads.filter(l => l.followUpDate && l.followUpDate < todayStr);
  const todayInbound = leads.filter(l => l.followUpDate && l.followUpDate === todayStr);
  const upcomingInbound = leads.filter(l => l.followUpDate && l.followUpDate > todayStr);

  // Outreach Leads with dates
  const overdueOutreach = outreachLeads.filter(o => o.followUpDate && o.followUpDate < todayStr);
  const todayOutreach = outreachLeads.filter(o => o.followUpDate && o.followUpDate === todayStr);
  const upcomingOutreach = outreachLeads.filter(o => o.followUpDate && o.followUpDate > todayStr);

  const totalOverdue = overdueInbound.length + overdueOutreach.length;
  const totalToday = todayInbound.length + todayOutreach.length;
  const totalUpcoming = upcomingInbound.length + upcomingOutreach.length;

  const handleOpenWhatsApp = (phone, name, serviceOrCompany) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const serviceName = Array.isArray(serviceOrCompany) 
      ? serviceOrCompany[0] 
      : (serviceOrCompany || 'our digital marketing services');
    
    const template = settings.whatsappTemplates?.[0]?.message || 'Hello {name}! Following up regarding {service}.';
    const text = template
      .replace('{name}', name || 'Client')
      .replace('{service}', serviceName);

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReschedule = async (item, isOutreach, daysToAdd) => {
    const newDate = new Date(Date.now() + daysToAdd * 86400000).toISOString().split('T')[0];
    const existingNotes = item.followUpNotes || [];
    const noteText = quickNoteMap[item._id] || `Rescheduled follow-up to ${newDate}`;

    const updatedNotes = [
      ...existingNotes,
      {
        _id: 'note_' + Date.now(),
        date: new Date().toISOString(),
        note: noteText,
        outcome: 'Connected',
        addedAt: 'Just now'
      }
    ];

    if (isOutreach) {
      await saveOutreachLead({
        _id: item._id,
        followUpDate: newDate,
        followUpNotes: updatedNotes
      });
    } else {
      await saveLead({
        _id: item._id,
        followUpDate: newDate,
        followUpNotes: updatedNotes
      });
    }

    setQuickNoteMap(prev => {
      const copy = { ...prev };
      delete copy[item._id];
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <BellRing className="w-5 h-5 animate-bounce-gentle" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Follow-up Notice & Reminder Center
                <button
                  type="button"
                  onClick={playNotificationChime}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:bg-slate-100"
                  title="Test Sound Chime"
                >
                  <Volume2 className="w-3 h-3 text-amber-500" />
                  Test Sound
                </button>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Never forget a client follow-up! Message on WhatsApp and reschedule with 1-click.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReminderModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Notices ({totalOverdue + totalToday + totalUpcoming})
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overdue'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Overdue ({totalOverdue})
          </button>

          <button
            onClick={() => setActiveTab('today')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'today'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Due Today ({totalToday})
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'upcoming'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upcoming ({totalUpcoming})
          </button>
        </div>

        {/* Reminder Items List */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {totalOverdue === 0 && totalToday === 0 && totalUpcoming === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">All Follow-ups Complete!</h4>
              <p className="text-xs text-slate-500">No scheduled reminders are currently pending.</p>
            </div>
          ) : (
            <>
              {/* Overdue Section */}
              {(activeTab === 'all' || activeTab === 'overdue') && overdueInbound.length + overdueOutreach.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Overdue Follow-up Notices ({overdueInbound.length + overdueOutreach.length})</span>
                  </div>

                  {overdueInbound.map(item => (
                    <ReminderCard
                      key={item._id}
                      item={item}
                      isOutreach={false}
                      isOverdue={true}
                      quickNote={quickNoteMap[item._id] || ''}
                      onNoteChange={(txt) => setQuickNoteMap({ ...quickNoteMap, [item._id]: txt })}
                      onWhatsApp={() => handleOpenWhatsApp(item.phone, item.name, item.services)}
                      onReschedule={(days) => handleReschedule(item, false, days)}
                    />
                  ))}

                  {overdueOutreach.map(item => (
                    <ReminderCard
                      key={item._id}
                      item={item}
                      isOutreach={true}
                      isOverdue={true}
                      quickNote={quickNoteMap[item._id] || ''}
                      onNoteChange={(txt) => setQuickNoteMap({ ...quickNoteMap, [item._id]: txt })}
                      onWhatsApp={() => handleOpenWhatsApp(item.phone, item.name, item.company)}
                      onReschedule={(days) => handleReschedule(item, true, days)}
                    />
                  ))}
                </div>
              )}

              {/* Due Today Section */}
              {(activeTab === 'all' || activeTab === 'today') && todayInbound.length + todayOutreach.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span>Due Today Notices ({todayInbound.length + todayOutreach.length})</span>
                  </div>

                  {todayInbound.map(item => (
                    <ReminderCard
                      key={item._id}
                      item={item}
                      isOutreach={false}
                      isDueToday={true}
                      quickNote={quickNoteMap[item._id] || ''}
                      onNoteChange={(txt) => setQuickNoteMap({ ...quickNoteMap, [item._id]: txt })}
                      onWhatsApp={() => handleOpenWhatsApp(item.phone, item.name, item.services)}
                      onReschedule={(days) => handleReschedule(item, false, days)}
                    />
                  ))}

                  {todayOutreach.map(item => (
                    <ReminderCard
                      key={item._id}
                      item={item}
                      isOutreach={true}
                      isDueToday={true}
                      quickNote={quickNoteMap[item._id] || ''}
                      onNoteChange={(txt) => setQuickNoteMap({ ...quickNoteMap, [item._id]: txt })}
                      onWhatsApp={() => handleOpenWhatsApp(item.phone, item.name, item.company)}
                      onReschedule={(days) => handleReschedule(item, true, days)}
                    />
                  ))}
                </div>
              )}

              {/* Upcoming Section */}
              {(activeTab === 'all' || activeTab === 'upcoming') && upcomingInbound.length + upcomingOutreach.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Calendar className="w-4 h-4" />
                    <span>Upcoming Follow-ups ({upcomingInbound.length + upcomingOutreach.length})</span>
                  </div>

                  {upcomingInbound.map(item => (
                    <ReminderCard
                      key={item._id}
                      item={item}
                      isOutreach={false}
                      quickNote={quickNoteMap[item._id] || ''}
                      onNoteChange={(txt) => setQuickNoteMap({ ...quickNoteMap, [item._id]: txt })}
                      onWhatsApp={() => handleOpenWhatsApp(item.phone, item.name, item.services)}
                      onReschedule={(days) => handleReschedule(item, false, days)}
                    />
                  ))}

                  {upcomingOutreach.map(item => (
                    <ReminderCard
                      key={item._id}
                      item={item}
                      isOutreach={true}
                      quickNote={quickNoteMap[item._id] || ''}
                      onNoteChange={(txt) => setQuickNoteMap({ ...quickNoteMap, [item._id]: txt })}
                      onWhatsApp={() => handleOpenWhatsApp(item.phone, item.name, item.company)}
                      onReschedule={(days) => handleReschedule(item, true, days)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <p className="text-xs text-slate-500">
            🔔 Notice alarms keep your pipeline moving and increase closing win rate by 40%!
          </p>
          <button
            onClick={() => setIsReminderModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            Close Notice Center
          </button>
        </div>

      </div>
    </div>
  );
}

function ReminderCard({ item, isOutreach, isOverdue, isDueToday, quickNote, onNoteChange, onWhatsApp, onReschedule }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
      isOverdue
        ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
        : isDueToday
          ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {item.name}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {item.phone}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {isOutreach ? 'Cold Outreach' : 'WhatsApp Lead'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {item.company ? `Company: ${item.company} • ` : ''}
            {item.requirements || item.generalNotes || 'Review requirements with client'}
          </p>
        </div>

        <div className="text-right">
          <div className={`text-xs font-bold ${isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isOverdue ? '🚨 Overdue: ' : isDueToday ? '⏰ Due Today: ' : '📅 '}{item.followUpDate}
          </div>
          <div className="text-[10px] text-slate-400">
            {item.followUpTime ? `Time: ${item.followUpTime}` : ''}
          </div>
        </div>
      </div>

      {/* Quick Note Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Log quick follow-up outcome note (e.g. Sent pricing, said call next Tuesday)..."
          value={quickNote}
          onChange={(e) => onNoteChange(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
        <button
          onClick={onWhatsApp}
          className="px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>WhatsApp Chat Now</span>
        </button>

        {/* Reschedule Shortcuts */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 mr-1">Reschedule:</span>
          <button
            onClick={() => onReschedule(1)}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
          >
            +1 Day
          </button>
          <button
            onClick={() => onReschedule(3)}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
          >
            +3 Days
          </button>
          <button
            onClick={() => onReschedule(7)}
            className="px-2.5 py-1 rounded-lg font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
          >
            +1 Week
          </button>
        </div>
      </div>
    </div>
  );
}

