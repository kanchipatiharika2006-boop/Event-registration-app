import React, { useState } from 'react';
import { Calendar, MapPin, Users, Award, ShieldAlert, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { Event } from '../types';

interface HomePageProps {
  events: Event[];
  onNavigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ events, onNavigate }) => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Take the first 3 events as featured
  const featuredEvents = events.slice(0, 3);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div id="home-page" className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 md:mx-8 px-6 py-16 md:py-24 mt-4 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-900 to-slate-900 opacity-90 z-0" />
        
        {/* Abstract design elements to avoid low-quality indicators */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Empowering Campus Life & Learning
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            Discover. Register. <br />
            <span className="text-indigo-400">Unleash Your Potential.</span>
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Your single gateway to technical hackathons, athletic events, acoustic nights, and business summits across departments. Secure your seats today!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="hero-explore-btn"
              onClick={() => onNavigate('events')}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              Explore Events
              <Calendar className="w-4 h-4" />
            </button>
            <button
              id="hero-about-btn"
              onClick={() => {
                const element = document.getElementById('about-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl transition duration-200 cursor-pointer flex items-center justify-center"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Metric Strips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0 pr-2">
            <div className="text-3xl font-display font-extrabold text-indigo-600">15+</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Departments</div>
          </div>
          <div className="text-center space-y-1 md:border-r border-slate-100 last:border-0 px-2">
            <div className="text-3xl font-display font-extrabold text-indigo-600">50+</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Events</div>
          </div>
          <div className="text-center space-y-1 border-r border-slate-100 last:border-0 px-2">
            <div className="text-3xl font-display font-extrabold text-indigo-600">3,500+</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Registered Students</div>
          </div>
          <div className="text-center space-y-1 last:border-0 pl-2">
            <div className="text-3xl font-display font-extrabold text-indigo-600">100%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Skill Growth</div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Featured Events
            </h2>
            <p className="text-slate-500 max-w-md">
              Highly anticipated and popular events happening soon on campus. Don't miss out!
            </p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1 cursor-pointer group"
          >
            View All Events
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredEvents.map((evt) => {
            const isSoldOut = evt.availableSeats === 0;
            const filledPercent = Math.round(((evt.totalSeats - evt.availableSeats) / evt.totalSeats) * 100);

            return (
              <div
                key={evt.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-indigo-600 shadow-sm border border-slate-100">
                    {evt.category}
                  </div>
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-4 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center gap-1 shadow">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Event Venue & Date */}
                    <div className="flex flex-col gap-1.5 text-xs text-slate-500 border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{new Date(evt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>{evt.availableSeats} of {evt.totalSeats} seats left</span>
                        <span>{filledPercent}% filled</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isSoldOut ? 'bg-red-500' : 'bg-indigo-600'}`}
                          style={{ width: `${filledPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => onNavigate('event-details', { eventId: evt.id })}
                        className="flex-1 py-2 px-4 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-100 text-xs font-semibold rounded-lg transition"
                      >
                        Details
                      </button>
                      {!isSoldOut ? (
                        <button
                          onClick={() => onNavigate('register', { eventId: evt.id })}
                          className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Register
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-2 px-4 bg-slate-100 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                        >
                          Full
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="bg-slate-100 rounded-3xl py-16 px-6 sm:px-12 mx-4 sm:mx-6 md:mx-8 border border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-white border border-slate-200 text-indigo-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              About the System
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Elevate Your College Academic and Extracurricular Journey
            </h2>
            <p className="text-slate-600 leading-relaxed">
              We believe college is more than just lectures and examinations. It's about finding your community, discovering hidden talents, pushing technological boundaries, and expressing artistic flair.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our <strong>Event Registration System</strong> provides an elegant and fully unified portal that keeps students updated with all departmental happenings. Registration takes just 2 clicks, letting you claim your ticket instantly and receive automatic notifications.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-xs text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Official Certificates</h4>
                  <p className="text-xs text-slate-500">Receive verified credit hours for attending workshops.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-xs text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Interactive Networking</h4>
                  <p className="text-xs text-slate-500">Collaborate directly with cross-department peers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-video lg:aspect-square bg-slate-300 rounded-2xl overflow-hidden border-2 border-white shadow-md">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
              alt="Students collaborating"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm">
          {/* Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Get in Touch
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Have questions about registration, scheduling details, or sponsoring an event? Contact the Central Student Committee directly. We're here to help!
            </p>

            <div className="space-y-4 pt-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h5 className="font-semibold text-slate-800">Campus Location</h5>
                  <p className="text-xs text-slate-500">Student Center Building, Block-D, Room 102</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h5 className="font-semibold text-slate-800">Support Desk Hours</h5>
                  <p className="text-xs text-slate-500">Monday - Friday: 9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <h5 className="font-semibold text-slate-800">General Inquiry Email</h5>
                  <p className="text-xs text-slate-500">events-help@college.edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-slate-500">
                Send a Message
              </h4>
              
              {submitted && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  Your message has been sent successfully! We will get back to you soon.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">College Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. name@college.edu"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Your Inquiry</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="How can we assist you?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Submit Message'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
