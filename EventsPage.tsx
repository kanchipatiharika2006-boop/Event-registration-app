import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Event } from '../types';

interface EventsPageProps {
  events: Event[];
  onNavigate: (page: string, params?: any) => void;
}

const CATEGORIES = ['All', 'Technology', 'Cultural', 'Sports', 'Business', 'General'];

export const EventsPage: React.FC<EventsPageProps> = ({ events, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [hideSoldOut, setHideSoldOut] = useState(false);

  // Filter events based on options
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesSearch = evt.title.toLowerCase().includes(search.toLowerCase()) || 
                            evt.description.toLowerCase().includes(search.toLowerCase()) ||
                            evt.venue.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = activeCategory === 'All' || evt.category === activeCategory;
      const matchesAvailability = !hideSoldOut || evt.availableSeats > 0;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [events, search, activeCategory, hideSoldOut]);

  return (
    <div id="events-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and intro */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Campus Events Calendar
        </h1>
        <p className="text-slate-500 max-w-xl text-sm">
          Browse, filter, and register for hundreds of department events, conferences, and student fests. Keep track of limited vacancies.
        </p>
      </div>

      {/* Control Panel (Search, Categories, and Toggles) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search bar */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              id="event-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, department, venue or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto shrink-0 justify-between sm:justify-start">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 text-sm select-none">
              <input
                type="checkbox"
                checked={hideSoldOut}
                onChange={(e) => setHideSoldOut(e.target.checked)}
                className="w-4.5 h-4.5 accent-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
              />
              <span>Hide Sold Out</span>
            </label>

            <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{filteredEvents.length} active found</span>
            </div>
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => {
            const isSoldOut = evt.availableSeats === 0;
            const filledPercent = Math.round(((evt.totalSeats - evt.availableSeats) / evt.totalSeats) * 100);

            // Format date-time nicely
            const dateObj = new Date(evt.date);
            const dateStr = dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const timeStr = dateObj.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={evt.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full text-xs font-semibold text-indigo-600 shadow-sm border border-slate-100">
                    {evt.category}
                  </div>

                  {/* Seat Limit Warning */}
                  {!isSoldOut && evt.availableSeats <= 10 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] uppercase rounded-sm tracking-wide shadow-xs">
                      Only {evt.availableSeats} Left!
                    </div>
                  )}

                  {/* Sold out overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                      <span className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center gap-1 shadow">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Contents */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-50">
                    {/* Location and Schedule */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{timeStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Ticket className="w-3 h-3" />
                          {evt.availableSeats} of {evt.totalSeats} seats open
                        </span>
                        <span>{filledPercent}% filled</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isSoldOut ? 'bg-red-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${filledPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => onNavigate('event-details', { eventId: evt.id })}
                        className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition"
                      >
                        Details
                      </button>
                      {!isSoldOut ? (
                        <button
                          onClick={() => onNavigate('register', { eventId: evt.id })}
                          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-xs"
                        >
                          Register Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-2 px-3 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-slate-800">No Events Found</h3>
            <p className="text-sm text-slate-500">
              We couldn't find any events matching "{search}" under "{activeCategory}" category. Try refining your search.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setActiveCategory('All');
              setHideSoldOut(false);
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
