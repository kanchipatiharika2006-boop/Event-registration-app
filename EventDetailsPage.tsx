import React from 'react';
import { Calendar, MapPin, Ticket, ShieldAlert, CheckCircle, ArrowLeft, Users, Tag, Award } from 'lucide-react';
import { Event } from '../types';

interface EventDetailsPageProps {
  eventId: string;
  events: Event[];
  isRegistered: boolean;
  isSignedIn: boolean;
  onNavigate: (page: string, params?: any) => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  eventId,
  events,
  isRegistered,
  isSignedIn,
  onNavigate
}) => {
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-slate-500 text-sm">
          The event you are looking for does not exist or has been removed by the administrator.
        </p>
        <button
          onClick={() => onNavigate('events')}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold transition"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const isSoldOut = event.availableSeats === 0;
  const filledPercent = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);

  // Parse Date
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div id="event-details-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('events')}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-semibold cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
        <span>Back to all events</span>
      </button>

      {/* Hero Header Area */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 h-64 sm:h-96 relative bg-slate-100">
          <img
            src={event.image}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 px-3.5 py-1 bg-white/95 backdrop-blur-xs rounded-full text-xs font-bold text-indigo-600 shadow border border-slate-100 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            {event.category}
          </div>
        </div>

        {/* Short Summary on side */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-50 border-l border-slate-100">
          <div className="space-y-4">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {event.title}
            </h1>
            
            <div className="space-y-3 text-sm text-slate-600 pt-2">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">{formattedDate}</p>
                  <p className="text-xs text-slate-500">Starts at {formattedTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">{event.venue}</p>
                  <p className="text-xs text-slate-500">College Campus</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-xs">
            {/* Real-time Seat Indicator */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                  Seat Availability
                </span>
                <span>{event.availableSeats} of {event.totalSeats} open</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isSoldOut ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${filledPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                {filledPercent}% of capacity has been claimed
              </p>
            </div>

            {/* State Actions */}
            {isRegistered ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs flex items-start gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">You are Registered!</p>
                    <p className="text-emerald-700 font-normal">Your seat is fully secured. View your digital slip in your dashboard.</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition cursor-pointer flex items-center justify-center"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : isSoldOut ? (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Event Sold Out</p>
                  <p className="text-red-700 font-normal">Sorry, no additional seats can be allocated for this event.</p>
                </div>
              </div>
            ) : !isSignedIn ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center">
                  Authentication is required to book tickets.
                </p>
                <button
                  onClick={() => onNavigate('login', { redirectEventId: event.id })}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center shadow"
                >
                  Sign In to Register
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('register', { eventId: event.id })}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center shadow-md hover:shadow"
              >
                Book Your Spot Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Extensive Description Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main: Detailed breakdown */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Event Details & Guidelines
            </h2>
            <div className="w-12 h-1 bg-indigo-600 rounded-full" />
          </div>

          <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {event.description}
          </p>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">
              What to Expect
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Attendance Credit</h4>
                  <p className="text-xs text-slate-500">Earn official co-curricular credit points.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Group Networking</h4>
                  <p className="text-xs text-slate-500">Q&A session with industry experts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Terms and Guidelines */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Important Rules</h3>
          <ul className="space-y-2 text-xs text-slate-500 list-disc list-inside leading-relaxed">
            <li>Please bring your physical College ID card for verification.</li>
            <li>Be present at the venue at least 15 minutes before the start time.</li>
            <li>No external food or beverages are permitted in the labs/hall.</li>
            <li>In case you cannot attend, please cancel your registration at least 2 hours in advance to release the seat.</li>
            <li>Certificates will only be issued upon scanning the exit QR code.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
