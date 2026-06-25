import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Calendar, Ticket, User, LogOut, GraduationCap, Grid, Info, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Event, Registration } from './types';

// Page Imports
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

interface RouterState {
  page: string;
  params?: any;
}

function MainApp() {
  const { user, isAuthenticated, isAdmin, logout, loading: authLoading } = useAuth();
  
  // Navigation Router state
  const [route, setRoute] = useState<RouterState>({ page: 'home' });
  const [, startTransition] = useTransition();

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global events database state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // User's own registrations (used for checked event detail badges)
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);

  // Load events
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const data = await api.events.getAll();
      setEvents(data);
    } catch (err: any) {
      setEventsError(err.message || 'Failed to fetch events catalog.');
    } finally {
      setEventsLoading(false);
    }
  };

  // Load current user registrations if logged in
  const fetchMyRegistrations = async () => {
    if (isAuthenticated && user?.role === 'user') {
      try {
        const regs = await api.registrations.getMyRegistrations();
        setMyRegistrations(regs);
      } catch (err) {
        console.error('Error loading current user registrations:', err);
      }
    } else {
      setMyRegistrations([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchMyRegistrations();
  }, [isAuthenticated, user]);

  // Navigate helper
  const navigateTo = (page: string, params?: any) => {
    startTransition(() => {
      setRoute({ page, params });
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleLogout = () => {
    logout();
    navigateTo('home');
  };

  // Check if student has registered for a specific event
  const isRegisteredForEvent = (evtId: string) => {
    return myRegistrations.some(r => r.eventId === evtId);
  };

  // Rendering logic
  const renderPage = () => {
    if (eventsLoading && events.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Synchronizing campus event listings...</p>
        </div>
      );
    }

    switch (route.page) {
      case 'home':
        return <HomePage events={events} onNavigate={navigateTo} />;
      case 'events':
        return <EventsPage events={events} onNavigate={navigateTo} />;
      case 'event-details':
        return (
          <EventDetailsPage
            eventId={route.params?.eventId}
            events={events}
            isRegistered={isRegisteredForEvent(route.params?.eventId)}
            isSignedIn={isAuthenticated}
            onNavigate={navigateTo}
          />
        );
      case 'register':
        return (
          <RegisterPage
            events={events}
            selectedEventId={route.params?.eventId}
            onNavigate={navigateTo}
            onRefreshEvents={fetchEvents}
          />
        );
      case 'login':
        return <LoginPage onNavigate={navigateTo} redirectEventId={route.params?.redirectEventId} />;
      case 'signup':
        return <SignupPage onNavigate={navigateTo} />;
      case 'dashboard':
        if (isAdmin) {
          return (
            <AdminDashboard
              events={events}
              onRefreshEvents={fetchEvents}
              onNavigate={navigateTo}
            />
          );
        }
        return (
          <UserDashboard
            onNavigate={navigateTo}
            onRefreshEvents={fetchEvents}
          />
        );
      default:
        return <HomePage events={events} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/25 transition group-hover:scale-105">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-extrabold text-base text-slate-900 tracking-tight block">
                  Campus Events
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">
                  Central Portal
                </span>
              </div>
            </div>

            {/* Desktop Navigation links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
              <button
                onClick={() => navigateTo('home')}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${route.page === 'home' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('events')}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${route.page === 'events' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}
              >
                Events
              </button>
              <button
                onClick={() => navigateTo('register')}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${route.page === 'register' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}
              >
                Register
              </button>
              
              {/* Conditional Auth links */}
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mx-4" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-1 pl-4 border-l border-slate-150">
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className={`px-4 py-2 rounded-xl transition font-bold cursor-pointer flex items-center gap-1.5 ${
                      route.page === 'dashboard'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-4 border-l border-slate-150">
                  <button
                    onClick={() => navigateTo('login')}
                    className="px-4 py-2 hover:bg-slate-50 text-indigo-600 font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button
                    onClick={() => navigateTo('signup')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm hover:shadow"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 focus:outline-hidden cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2 flex flex-col font-semibold text-sm text-slate-600">
                <button
                  onClick={() => navigateTo('home')}
                  className={`w-full py-2 px-4 rounded-xl text-left cursor-pointer ${route.page === 'home' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}
                >
                  Home
                </button>
                <button
                  onClick={() => navigateTo('events')}
                  className={`w-full py-2 px-4 rounded-xl text-left cursor-pointer ${route.page === 'events' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}
                >
                  Events
                </button>
                <button
                  onClick={() => navigateTo('register')}
                  className={`w-full py-2 px-4 rounded-xl text-left cursor-pointer ${route.page === 'register' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}
                >
                  Register Form
                </button>

                {isAuthenticated ? (
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className={`w-full py-2.5 px-4 rounded-xl text-left flex items-center gap-2 cursor-pointer ${
                        route.page === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      {isAdmin ? 'Admin Console' : 'My Student Dashboard'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 px-4 bg-red-50 text-red-600 rounded-xl text-left flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigateTo('login')}
                      className="py-2 px-4 border border-slate-200 text-indigo-600 rounded-xl text-center cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigateTo('signup')}
                      className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-center cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area with dynamic motion sliding entering transition */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.page + (route.params?.eventId || '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <span className="font-display font-bold text-white tracking-tight">
                Campus Events
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The unified digital platform empowering students to discover academic hackathons, athletic events, acoustic music nights, and cultural festivals across departments.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white cursor-pointer">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('events')} className="hover:text-white cursor-pointer">
                  All Events Calendar
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('register')} className="hover:text-white cursor-pointer">
                  Registration Form
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Popular Streams</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('events')} className="hover:text-white cursor-pointer">
                  Technology workshops
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('events')} className="hover:text-white cursor-pointer">
                  Cultural festivals & concerts
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('events')} className="hover:text-white cursor-pointer">
                  Sports tournaments
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform details */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">System Support</h4>
            <p className="text-xs text-slate-400">
              Student Service Wing<br />
              Central Campus, Block D, Room 102<br />
              Email: <span className="text-indigo-400">events-help@college.edu</span>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; 2026 College Event Committee. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 py-0.5 px-2 rounded-full font-mono font-semibold uppercase tracking-wider">
              Dual Storage Engine Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
