'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  User, 
  FileSpreadsheet,
  LayoutGrid,
  Copy
} from 'lucide-react';
import { exportToExcel, exportToCsv } from '@/lib/excelUtils';

export default function MeetingsView() {
  const { 
    meetings, 
    setIsMeetingModalOpen, 
    setEditingMeeting, 
    saveMeeting, 
    removeMeeting 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [copiedId, setCopiedId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsAppCall = (phone, clientName) => {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const text = `Hello ${clientName || 'there'}! This is regarding our scheduled meeting today. Ready to connect whenever you are!`;
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      alert('No valid phone number for WhatsApp.');
    }
  };

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          m.title?.toLowerCase().includes(q) ||
          m.clientName?.toLowerCase().includes(q) ||
          m.phone?.includes(q) ||
          m.agenda?.toLowerCase().includes(q) ||
          m.platform?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterStatus !== 'All' && m.status !== filterStatus) {
        return false;
      }

      if (filterPeriod === 'Today' && m.meetingDate !== todayStr) return false;
      if (filterPeriod === 'Tomorrow' && m.meetingDate !== tomorrow) return false;
      if (filterPeriod === 'Upcoming' && m.meetingDate < todayStr) return false;
      if (filterPeriod === 'Past' && m.meetingDate >= todayStr) return false;

      return true;
    }).sort((a, b) => {
      // Sort by date, then time
      return a.meetingDate.localeCompare(b.meetingDate);
    });
  }, [meetings, search, filterStatus, filterPeriod, todayStr, tomorrow]);

  // Quick stats
  const todayCount = meetings.filter(m => m.meetingDate === todayStr && m.status === 'Scheduled').length;
  const upcomingCount = meetings.filter(m => m.meetingDate > todayStr && m.status === 'Scheduled').length;
  const completedCount = meetings.filter(m => m.status === 'Completed').length;

  const handleExport = (type) => {
    const data = filteredMeetings.map((m, i) => ({
      'SL': i + 1,
      'Title': m.title || '',
      'Client Name': m.clientName || '',
      'Phone': m.phone || '',
      'Date': m.meetingDate || '',
      'Time': m.meetingTime || '',
      'Platform': m.platform || '',
      'Meeting Link': m.meetingLink || '',
      'Status': m.status || 'Scheduled',
      'Agenda': m.agenda || '',
      'Notes': m.notes || ''
    }));

    if (type === 'xlsx') {
      exportToExcel(data, `Meetings_Schedule_${todayStr}.xlsx`, 'Meetings');
    } else {
      exportToCsv(data, `Meetings_Schedule_${todayStr}.csv`);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
          <div className="text-[11px] font-bold uppercase tracking-wider">Today&apos;s Calls</div>
          <div className="text-2xl font-black mt-1">{todayCount}</div>
          <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80">Scheduled today</div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300">
          <div className="text-[11px] font-bold uppercase tracking-wider">Upcoming</div>
          <div className="text-2xl font-black mt-1">{upcomingCount}</div>
          <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">Future bookings</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          <div className="text-[11px] font-bold uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-black mt-1">{completedCount}</div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Finished meetings</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-700 dark:text-slate-300">
          <div className="text-[11px] font-bold uppercase tracking-wider">Total Booked</div>
          <div className="text-2xl font-black mt-1">{meetings.length}</div>
          <div className="text-[10px] text-slate-600/80 dark:text-slate-400/80">All records</div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Client Meeting & Demo Schedule</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {filteredMeetings.length} Scheduled
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Never miss a client call, proposal demo, or Google Meet presentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              title="Table View"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800"
          >
            Export Excel
          </button>

          <button
            onClick={() => {
              setEditingMeeting(null);
              setIsMeetingModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meeting, client, platform..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Dates</option>
              <option value="Today">📅 Today&apos;s Meetings</option>
              <option value="Tomorrow">⏩ Tomorrow</option>
              <option value="Upcoming">⏳ Upcoming (Future)</option>
              <option value="Past">📁 Past Meetings</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">⏳ Scheduled</option>
              <option value="Completed">✅ Completed</option>
              <option value="Rescheduled">🔄 Rescheduled</option>
              <option value="Cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* View: Table or Mobile Cards */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4 min-w-[200px]">Client / Title</th>
                  <th className="py-3 px-4 min-w-[140px]">Date & Time</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Platform / Link</th>
                  <th className="py-3 px-3.5 min-w-[120px]">Status</th>
                  <th className="py-3 px-4 min-w-[200px]">Agenda</th>
                  <th className="py-3 px-4 text-right min-w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Calendar className="w-10 h-10 mx-auto opacity-50 text-blue-500" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Meetings Scheduled</h4>
                        <p className="text-xs text-slate-500">
                          Click &quot;Schedule Meeting&quot; to book a call with your clients.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((m, idx) => {
                    const isToday = m.meetingDate === todayStr;
                    const isPast = m.meetingDate < todayStr;
                    const isDone = m.status === 'Completed';

                    return (
                      <tr 
                        key={m._id || idx}
                        className={`hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors ${
                          isToday && !isDone ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {/* # */}
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Client / Title */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {m.clientName}
                          </div>
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {m.title}
                          </div>
                          {m.phone && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              📞 {m.phone}
                            </div>
                          )}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span>{m.meetingDate}</span>
                            {isToday && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                TODAY
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{m.meetingTime || 'TBD'}</span>
                          </div>
                        </td>

                        {/* Platform / Link */}
                        <td className="py-3 px-3.5">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-1">
                            {m.platform}
                          </span>
                          {m.meetingLink ? (
                            <div>
                              <a
                                href={m.meetingLink.startsWith('http') ? m.meetingLink : `https://${m.meetingLink}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                              >
                                <span>Join Call</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : m.phone ? (
                            <button
                              onClick={() => handleOpenWhatsAppCall(m.phone, m.clientName)}
                              className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          ) : null}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5">
                          <select
                            value={m.status || 'Scheduled'}
                            onChange={async (e) => {
                              await saveMeeting({ _id: m._id, status: e.target.value });
                            }}
                            className={`px-2 py-1 text-[11px] font-bold rounded-xl border cursor-pointer ${
                              m.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : m.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            <option value="Scheduled">⏳ Scheduled</option>
                            <option value="Completed">✅ Completed</option>
                            <option value="Rescheduled">🔄 Rescheduled</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                        </td>

                        {/* Agenda */}
                        <td className="py-3 px-4">
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 max-w-xs" title={m.agenda}>
                            {m.agenda || 'No agenda provided'}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingMeeting(m);
                                setIsMeetingModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Meeting"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete meeting with "${m.clientName}"?`)) {
                                  removeMeeting(m._id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete Meeting"
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
        /* Mobile App Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-10 h-10 mx-auto opacity-50 text-blue-500 mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No Meetings Scheduled</h4>
              <p className="text-xs text-slate-500">
                Click &quot;Schedule Meeting&quot; to book client calls.
              </p>
            </div>
          ) : (
            filteredMeetings.map((m, idx) => {
              const isToday = m.meetingDate === todayStr;
              const isDone = m.status === 'Completed';

              return (
                <div
                  key={m._id || idx}
                  className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3 ${
                    isToday && !isDone ? 'ring-2 ring-blue-500/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {m.clientName}
                        </h3>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                        {m.title}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      m.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : isToday
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {isToday && !isDone ? '⚡ TODAY' : m.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{m.meetingDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{m.meetingTime || 'TBD'}</span>
                    </div>
                  </div>

                  {m.meetingLink ? (
                    <a
                      href={m.meetingLink.startsWith('http') ? m.meetingLink : `https://${m.meetingLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join {m.platform}</span>
                    </a>
                  ) : m.phone ? (
                    <button
                      onClick={() => handleOpenWhatsAppCall(m.phone, m.clientName)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call on WhatsApp</span>
                    </button>
                  ) : null}

                  {m.agenda && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                      {m.agenda}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={async () => {
                        await saveMeeting({ 
                          _id: m._id, 
                          status: m.status === 'Completed' ? 'Scheduled' : 'Completed' 
                        });
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        m.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{m.status === 'Completed' ? 'Undo Done' : 'Mark Completed'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMeeting(m);
                          setIsMeetingModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete meeting with "${m.clientName}"?`)) {
                            removeMeeting(m._id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}

