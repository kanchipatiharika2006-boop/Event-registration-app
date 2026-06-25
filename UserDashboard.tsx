import React, { useState, useEffect } from 'react';
import { Ticket, User, Phone, Mail, Calendar, MapPin, XCircle, Settings, CheckCircle2, QrCode, ClipboardList } from 'lucide-react';
import { Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface UserDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onRefreshEvents: () => Promise<void>;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate, onRefreshEvents }) => {
  const { user, updateProfile } = useAuth();
  
  // Dashboard states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Active Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await api.registrations.getMyRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone);
    }
  }, [user]);

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!profileName || !profilePhone) {
      setProfileError('All profile fields are required.');
      return;
    }

    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      setProfileSuccess(true);
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update student profile.');
    }
  };

  const handleCancelRegistration = async (regId: string) => {
    if (!window.confirm('Are you sure you want to cancel this event registration? This will permanently release your seat vacancy.')) {
      return;
    }

    try {
      await api.registrations.cancel(regId);
      // Reload registrations and refresh capacity in events
      await fetchRegistrations();
      await onRefreshEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration.');
    }
  };

  return (
    <div id="user-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-850">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Student Workspace
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light">
            Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span>! Track your campus event tickets and customize your profile.
          </p>
        </div>
        <button
          onClick={() => onNavigate('events')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4" />
          Browse More Events
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left side: Profile Management card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Student Profile
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 animate-spin-slow" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              {profileError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                  {profileError}
                </p>
              )}
              
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-600">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">Role: {user?.role}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{user?.phone || 'Not Provided'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Bookings list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5.5 h-5.5 text-indigo-600" />
              Active Registrations ({registrations.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Retrieving active ticket reservations...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 text-xs text-center">
              {error}
            </div>
          ) : registrations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {registrations.map((reg) => {
                const event = reg.event;
                if (!event) return null;

                const dateObj = new Date(event.date);
                const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">
                          {event.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {reg.id.substring(0, 8)}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 text-base line-clamp-1">
                        {event.title}
                      </h4>

                      <div className="space-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          {dateStr} | {timeStr}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="truncate">{event.venue}</span>
                        </p>
                      </div>
                    </div>

                    {/* Booking Controls */}
                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => setSelectedTicket(reg)}
                        className="flex-1 py-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View Ticket
                      </button>
                      <button
                        onClick={() => handleCancelRegistration(reg.id)}
                        className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-500 border border-red-100 hover:border-red-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-slate-800">No Registrations Yet</h3>
                <p className="text-sm text-slate-500">
                  You haven't registered for any college events. Let's find some interesting ones!
                </p>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition cursor-pointer"
              >
                Find & Register Events
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ticket QR/Pass Modal Dialog */}
      {selectedTicket && selectedTicket.event && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-2xl relative animate-fade-in">
            {/* Ticket Header */}
            <div className="bg-slate-900 text-white p-6 text-center space-y-1">
              <h3 className="font-display font-bold text-lg tracking-tight">ADMISSION PASS</h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">College Event Committee</p>
            </div>

            {/* Ticket Details */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">
                  {selectedTicket.event.category}
                </span>
                <h4 className="font-extrabold text-slate-900 text-lg leading-tight">
                  {selectedTicket.event.title}
                </h4>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Attendee</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedTicket.event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} |{' '}
                    {new Date(selectedTicket.event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Venue / Location</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{selectedTicket.event.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admission Ticket ID</span>
                  <span className="font-mono font-bold text-indigo-600">{selectedTicket.id}</span>
                </div>
              </div>

              {/* Simulated QR Code Area */}
              <div className="border-t border-dashed border-slate-200 pt-5 text-center space-y-3">
                <div className="w-36 h-36 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center mx-auto p-2">
                  {/* Digital QR Canvas Illustration */}
                  <div className="w-full h-full bg-slate-900 rounded-lg p-3 flex flex-wrap items-center justify-center gap-1 opacity-90 relative">
                    <QrCode className="w-20 h-20 text-white shrink-0" />
                    <div className="absolute inset-x-0 bottom-1 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                      Scan on entry
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                  Scan this QR code at the seminar hall check-in point with your physical student ID card.
                </p>
              </div>
            </div>

            {/* Ticket Footer Action */}
            <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-center">
              <button
                onClick={() => setSelectedTicket(null)}
                className="py-2 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
