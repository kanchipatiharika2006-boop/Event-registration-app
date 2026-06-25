import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, Ticket, Search, BarChart3, SlidersHorizontal, MapPin, Tag, RefreshCw, X, Check, ShieldAlert } from 'lucide-react';
import { Event, User, Registration, DashboardStats } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  events: Event[];
  onRefreshEvents: () => Promise<void>;
  onNavigate: (page: string, params?: any) => void;
}

type AdminTab = 'stats' | 'events' | 'users' | 'registrations';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  onRefreshEvents,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  
  // Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  
  // Loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filters
  const [userSearch, setUserSearch] = useState('');
  const [regSearch, setRegSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  // CRUD Modal Form States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Form values
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTotalSeats, setFormTotalSeats] = useState('100');
  const [formCategory, setFormCategory] = useState('Technology');
  const [formAvailableSeats, setFormAvailableSeats] = useState('');

  // Form notifications
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await api.admin.getStats();
      const usersData = await api.admin.getUsers();
      const regsData = await api.admin.getRegistrations();
      
      setStats(statsData);
      setUsers(usersData);
      setRegistrations(regsData);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [events]);

  // Handle Event Modal opening
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEventId(null);
    setFormTitle('');
    setFormDescription('');
    
    // Default formDate to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setFormDate(tomorrow.toISOString().substring(0, 16));
    
    setFormVenue('');
    setFormImage('');
    setFormTotalSeats('100');
    setFormCategory('Technology');
    setFormAvailableSeats('');
    setFormError(null);
    setFormSuccess(null);
    setIsEventModalOpen(true);
  };

  const openEditModal = (evt: Event) => {
    setModalMode('edit');
    setSelectedEventId(evt.id);
    setFormTitle(evt.title);
    setFormDescription(evt.description);
    
    // Parse to local datetime format (YYYY-MM-DDTHH:MM)
    const dateObj = new Date(evt.date);
    // Correct timezone shift
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().substring(0, 16);
    setFormDate(localISOTime);
    
    setFormVenue(evt.venue);
    setFormImage(evt.image);
    setFormTotalSeats(evt.totalSeats.toString());
    setFormCategory(evt.category || 'Technology');
    setFormAvailableSeats(evt.availableSeats.toString());
    setFormError(null);
    setFormSuccess(null);
    setIsEventModalOpen(true);
  };

  // Submit Event Creation or Modification
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formTitle || !formDescription || !formDate || !formVenue || !formTotalSeats) {
      setFormError('Please fill in all mandatory event attributes.');
      return;
    }

    const total = parseInt(formTotalSeats);
    if (isNaN(total) || total <= 0) {
      setFormError('Total seats must be a positive number.');
      return;
    }

    const payload: any = {
      title: formTitle,
      description: formDescription,
      date: new Date(formDate).toISOString(),
      venue: formVenue,
      image: formImage || undefined,
      totalSeats: total,
      category: formCategory
    };

    if (modalMode === 'edit' && formAvailableSeats) {
      const avail = parseInt(formAvailableSeats);
      if (!isNaN(avail) && avail >= 0) {
        payload.availableSeats = avail;
      }
    }

    try {
      if (modalMode === 'create') {
        await api.events.create(payload);
        setFormSuccess('New campus event created successfully!');
      } else if (modalMode === 'edit' && selectedEventId) {
        await api.events.update(selectedEventId, payload);
        setFormSuccess('Event attributes modified successfully!');
      }
      
      await onRefreshEvents(); // Refresh global events
      
      // Delay closing modal slightly to let user see success
      setTimeout(() => {
        setIsEventModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Action failed.');
    }
  };

  // Delete event handler
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`⚠️ CRITICAL WARNING:\nAre you sure you want to permanently delete event "${title}"?\n\nThis will also delete ALL associated student registrations. This action cannot be undone.`)) {
      return;
    }

    try {
      await api.events.delete(id);
      await onRefreshEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event.');
    }
  };

  // Revoke registration handler (Cancel registration as Admin)
  const handleRevokeRegistration = async (regId: string) => {
    if (!window.confirm('Are you sure you want to revoke this student registration? This releases their seat reservation.')) {
      return;
    }

    try {
      await api.registrations.cancel(regId);
      await onRefreshEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke registration.');
    }
  };

  // Filters calculation
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  const filteredRegs = registrations.filter(r => 
    (r.user?.name || '').toLowerCase().includes(regSearch.toLowerCase()) ||
    (r.user?.email || '').toLowerCase().includes(regSearch.toLowerCase()) ||
    (r.event?.title || '').toLowerCase().includes(regSearch.toLowerCase()) ||
    r.id.includes(regSearch)
  );

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.venue.toLowerCase().includes(eventSearch.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(eventSearch.toLowerCase())
  );

  return (
    <div id="admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-indigo-900">
        <div className="space-y-1">
          <div className="inline-block px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Admin Workspace
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Central Command Station
          </h1>
          <p className="text-indigo-200/80 text-xs font-light">
            Monitor registration velocities, authorize campus events, and manage student admission rosters.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAdminData}
            className="p-2 bg-indigo-900 hover:bg-indigo-850 text-indigo-300 hover:text-white rounded-xl transition cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            Create New Event
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-5 py-3 border-b-2 font-semibold text-sm cursor-pointer whitespace-nowrap transition-all duration-150 ${
            activeTab === 'stats'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5" />
            Overview & Charts
          </span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-3 border-b-2 font-semibold text-sm cursor-pointer whitespace-nowrap transition-all duration-150 ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4.5 h-4.5" />
            Manage Events ({events.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 border-b-2 font-semibold text-sm cursor-pointer whitespace-nowrap transition-all duration-150 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5" />
            Students Directory ({users.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-5 py-3 border-b-2 font-semibold text-sm cursor-pointer whitespace-nowrap transition-all duration-150 ${
            activeTab === 'registrations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Ticket className="w-4.5 h-4.5" />
            All Bookings ({registrations.length})
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 text-xs flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tab Render Container */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 text-sm">
          Compiling student metrics and transactions...
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* ==========================================
              TAB 1: STATISTICS OVERVIEW & GRAPH
              ========================================== */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8">
              {/* Core metrics count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Total Campus Events</span>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalEvents}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Total Reservations</span>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalRegistrations}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Student Accounts</span>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Capacity Booked</span>
                    <p className="text-2xl font-bold text-slate-800">{stats.seatsFilledPercentage}%</p>
                  </div>
                </div>
              </div>

              {/* Graphical registration distribution */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">
                    Student Registrations Per Event
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compares current reservations against total capacities for each active event.
                  </p>
                </div>

                {/* Customized Responsive HTML/Tailwind chart */}
                <div className="space-y-5 pt-2">
                  {stats.registrationsByEvent.map((item, idx) => {
                    const percentFilled = item.totalSeats > 0 ? Math.round((item.seatsFilled / item.totalSeats) * 100) : 0;
                    
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs">
                          <span className="font-semibold text-slate-800 line-clamp-1">{item.eventTitle}</span>
                          <span className="text-slate-500 font-mono shrink-0">
                            <strong>{item.count}</strong> reservations | {item.seatsFilled}/{item.totalSeats} seats booked ({percentFilled}%)
                          </span>
                        </div>
                        <div className="w-full h-4 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex">
                          <div
                            className={`h-full rounded-l transition-all duration-500 ${
                              percentFilled >= 100 ? 'bg-red-500' : percentFilled >= 75 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: EVENTS LEDGER (CRUD & Actions)
              ========================================== */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Event Search header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Filter events list..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>

              {/* Table / List layout for admin events */}
              {filteredEvents.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4">Cover / Event Title</th>
                        <th className="p-4 hidden md:table-cell">Schedule</th>
                        <th className="p-4 hidden sm:table-cell">Venue</th>
                        <th className="p-4">Seats Log</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {filteredEvents.map((evt) => {
                        const dateObj = new Date(evt.date);
                        const isSoldOut = evt.availableSeats === 0;

                        return (
                          <tr key={evt.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 flex items-center gap-3">
                              <img
                                src={evt.image}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200"
                              />
                              <div className="space-y-0.5 truncate max-w-[200px] sm:max-w-[300px]">
                                <span className="font-bold text-slate-800 truncate block">{evt.title}</span>
                                <span className="px-2 py-0.2 bg-slate-100 text-slate-500 rounded text-[9px] font-semibold">{evt.category}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 hidden md:table-cell">
                              <p className="font-semibold">{dateObj.toLocaleDateString()}</p>
                              <p className="text-slate-400 text-xs">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="p-4 text-slate-500 hidden sm:table-cell truncate max-w-[150px]">
                              {evt.venue}
                            </td>
                            <td className="p-4 text-slate-600">
                              <span className={`font-bold ${isSoldOut ? 'text-red-500' : 'text-slate-800'}`}>
                                {evt.availableSeats}
                              </span>
                              <span className="text-slate-400 text-xs"> / {evt.totalSeats} left</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditModal(evt)}
                                  className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition border border-slate-200 cursor-pointer"
                                  title="Edit event details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                                  className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition border border-slate-200 cursor-pointer"
                                  title="Delete event and registrations"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No events match search filter.
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 3: STUDENTS DIRECTORY
              ========================================== */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Search */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search students by name, email, or contact number..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Contact Email</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4 text-center">System Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-700">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-850 flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            {u.name}
                          </td>
                          <td className="p-4 font-mono text-xs">{u.email}</td>
                          <td className="p-4">{u.phone}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              u.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No students found matching your search.
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 4: ALL REGISTRATIONS LEDGER
              ========================================== */}
          {activeTab === 'registrations' && (
            <div className="space-y-6">
              {/* Registration Search */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    placeholder="Search bookings by registration ID, student name, email, or event title..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
              </div>

              {filteredRegs.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4">Reg ID</th>
                        <th className="p-4">Student Attendee</th>
                        <th className="p-4">Booked Event</th>
                        <th className="p-4 hidden md:table-cell">Booking Date</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-700">
                      {filteredRegs.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono text-xs text-indigo-600 font-bold">
                            {reg.id.substring(0, 10)}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{reg.user?.name || 'Deleted Account'}</p>
                            <p className="text-slate-400 text-xs font-mono">{reg.user?.email}</p>
                          </td>
                          <td className="p-4 font-semibold text-slate-800 truncate max-w-[200px]">
                            {reg.event?.title || 'Deleted Event'}
                          </td>
                          <td className="p-4 text-slate-500 hidden md:table-cell">
                            {new Date(reg.registrationDate).toLocaleDateString()} at{' '}
                            {new Date(reg.registrationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleRevokeRegistration(reg.id)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                              title="Revoke and cancel registration"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No registrations found matching search.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          MODAL DIALOG: EVENT CREATE & EDIT FORM
          ========================================== */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-100 shadow-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <h3 className="font-display font-bold text-lg tracking-tight">
                {modalMode === 'create' ? 'Create Campus Event' : 'Modify Event Properties'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleEventSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
              
              {formError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. RoboWars 2026: Mechanical Combat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Complete Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide comprehensive details about schedule, perks, categories, rules, and timings..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Event Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Business">Business</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Event Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Venue Location *</label>
                  <input
                    type="text"
                    required
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="e.g. Auditorium Complex"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Total Seating Capacity *</label>
                  <input
                    type="number"
                    required
                    value={formTotalSeats}
                    onChange={(e) => setFormTotalSeats(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Modify Available Seats</label>
                  <input
                    type="number"
                    value={formAvailableSeats}
                    onChange={(e) => setFormAvailableSeats(e.target.value)}
                    placeholder="Manually adjust available openings if needed..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Illustration Cover Image URL</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Leave empty for beautiful abstract placeholder image"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Submit footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  {modalMode === 'create' ? 'Create Event' : 'Save Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
