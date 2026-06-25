import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, User, Mail, Phone, GraduationCap, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface RegisterPageProps {
  events: Event[];
  selectedEventId?: string;
  onNavigate: (page: string, params?: any) => void;
  onRefreshEvents: () => Promise<void>;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  events,
  selectedEventId,
  onNavigate,
  onRefreshEvents
}) => {
  const { user, isAuthenticated } = useAuth();

  // Form Fields
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('Central University of Engineering');
  const [eventId, setEventId] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync profile details if signed in
  useEffect(() => {
    if (user) {
      setStudentName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  // Handle default selected event
  useEffect(() => {
    if (selectedEventId) {
      setEventId(selectedEventId);
    } else if (events.length > 0) {
      // Find the first available event to default select
      const available = events.find(e => e.availableSeats > 0);
      if (available) {
        setEventId(available.id);
      } else {
        setEventId(events[0].id);
      }
    }
  }, [selectedEventId, events]);

  const selectedEventDetails = events.find(e => e.id === eventId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!isAuthenticated) {
      setLocalError('You must be signed in to submit registrations.');
      onNavigate('login', { redirectEventId: eventId });
      return;
    }

    if (!studentName || !email || !phone || !collegeName || !eventId) {
      setLocalError('Please fill in all form details.');
      return;
    }

    if (selectedEventDetails && selectedEventDetails.availableSeats <= 0) {
      setLocalError('Sorry, this event is completely sold out! Please select another event.');
      return;
    }

    setLoading(true);

    try {
      await api.registrations.register({
        eventId,
        studentName,
        email,
        phone,
        collegeName
      });
      
      setSuccess(true);
      await onRefreshEvents(); // Refresh capacity metrics on parent

      // Re-route to student dashboard
      setTimeout(() => {
        onNavigate('dashboard');
      }, 2000);
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed. You may already be registered for this event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-page" className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header card */}
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
          Event Registration Form
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Please provide your current student credentials to secure your digital admission ticket.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Success Prompt */}
        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-xs flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Booking Secured!</p>
              <p className="text-emerald-700 font-normal">Seat successfully booked! Redirecting to your Student Dashboard...</p>
            </div>
          </div>
        )}

        {/* Local Error Block */}
        {localError && (
          <div className="p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-100 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
            <span>{localError}</span>
          </div>
        )}

        {/* Not Signed In Warning banner */}
        {!isAuthenticated && (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100 text-xs space-y-3">
            <p className="font-semibold leading-relaxed">
              ⚠️ You are currently browsing as a guest. Student Authentication is required to submit event registration forms.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Event Selection */}
          <div className="space-y-3 border-b border-slate-100 pb-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 text-indigo-600">
              <Calendar className="w-4.5 h-4.5" />
              1. Choose Event
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Event Selection</label>
                <select
                  required
                  id="event-select-dropdown"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  disabled={!!selectedEventId} // Disable if preset
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  {events.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title} {e.availableSeats === 0 ? '(SOLD OUT)' : ''}
                    </option>
                  ))}
                </select>
                {selectedEventId && (
                  <p className="text-[10px] text-slate-400">
                    Selected via event detail page link.
                  </p>
                )}
              </div>

              {/* Small Event Preview Card */}
              {selectedEventDetails && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5 text-xs">
                  <p className="font-bold text-slate-800 line-clamp-1">{selectedEventDetails.title}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Category: {selectedEventDetails.category}
                  </p>
                  <p className={`font-semibold ${selectedEventDetails.availableSeats === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    Available Seats: {selectedEventDetails.availableSeats} of {selectedEventDetails.totalSeats} remaining
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Student Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 text-indigo-600">
              <User className="w-4.5 h-4.5" />
              2. Student Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Student Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden"
                    placeholder="Student Full Name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">College Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden"
                    placeholder="e.g. rollnumber@college.edu"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden"
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">College / Institute Name</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden"
                    placeholder="e.g. University School of Tech"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines disclaimer */}
          <p className="text-[11px] text-slate-400 leading-relaxed text-center pt-2">
            By clicking "Submit Registration", you confirm that the credentials provided are accurate and authorize the Central Event Committee to allocate and log your slot. Double bookings are automatically rejected.
          </p>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading || success || !isAuthenticated}
            className={`w-full py-3 px-4 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer ${
              !isAuthenticated
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'
            }`}
          >
            {loading ? 'Processing Admission...' : success ? 'Confirmed!' : 'Submit Registration'}
            <Ticket className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
