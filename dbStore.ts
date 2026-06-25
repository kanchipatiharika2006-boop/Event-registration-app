import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Event, Registration } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  users: User[];
  events: Event[];
  registrations: Registration[];
}

// Initial seed data
const DEFAULT_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'TechHack 2026: Annual College Hackathon',
    description: 'Join over 500 developers, designers, and innovators for a 36-hour sprint to build solutions for real-world problems. Great prizes, free food, and networking opportunities with tech industry leaders!',
    date: '2026-07-15T09:00:00Z',
    venue: 'Main Seminar Hall & CSE Lab Annex',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    availableSeats: 45,
    totalSeats: 120,
    category: 'Technology'
  },
  {
    id: 'evt-2',
    title: 'Acoustic Unplugged: Inter-College Music Fest',
    description: 'Showcase your vocal and musical talents! Acoustic solos, bands, and instrumental mashups. Special guest performance by a prominent indie-pop artist to close out the night.',
    date: '2026-07-22T17:00:00Z',
    venue: 'Open Air Auditorium (OAT)',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    availableSeats: 0, // Mocking a sold-out event for dashboard display
    totalSeats: 300,
    category: 'Cultural'
  },
  {
    id: 'evt-3',
    title: 'National Robotics Arena (RoboWars)',
    description: 'Design, build, and fight! Watch heavy-metal combat robots face off in the arena. Also features line-follower, drone obstacle course, and robo-soccer leagues with amazing cash prizes.',
    date: '2026-08-05T10:00:00Z',
    venue: 'College Gymnasium Complex',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    availableSeats: 75,
    totalSeats: 150,
    category: 'Technology'
  },
  {
    id: 'evt-4',
    title: 'FinTech Summit: Future of Decentralized Finance',
    description: 'A deep dive into block chain, algorithmic trading, smart contracts, and microfinance. Led by industry stalwarts and business school mentors. Ideal for aspiring entrepreneurs.',
    date: '2026-08-12T14:00:00Z',
    venue: 'MBA Seminar Hall (Block C)',
    image: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=800&q=80',
    availableSeats: 58,
    totalSeats: 80,
    category: 'Business'
  },
  {
    id: 'evt-5',
    title: 'Inter-Departmental Athletics & Sports Meet',
    description: 'The ultimate battle for the college championship shield. Track and field events including 100m sprint, relay, long jump, shot put, alongside football and basketball tournaments.',
    date: '2026-07-10T07:30:00Z',
    venue: 'University Sports Stadium',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
    availableSeats: 180,
    totalSeats: 200,
    category: 'Sports'
  },
  {
    id: 'evt-6',
    title: 'Canvas & Clay: Fine Arts Exhibition',
    description: 'An open-gallery showcase of fine arts, clay modeling, charcoal sketches, and digital design created by student artists. Includes live caricature stations and hands-on pottery booths.',
    date: '2026-08-20T11:00:00Z',
    venue: 'Art Gallery & Central Lawn',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
    availableSeats: 45,
    totalSeats: 50,
    category: 'Cultural'
  }
];

export function getDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    // Generate initial database with seeded data
    const hashedPassword = bcrypt.hashSync('student123', 10);
    const hashedAdminPassword = bcrypt.hashSync('admin123', 10);

    const defaultUsers: User[] = [
      {
        id: 'usr-1',
        name: 'Harika Kanchipati',
        email: 'kanchipatiharika2006@gmail.com',
        phone: '9876543210',
        role: 'admin',
        password: hashedAdminPassword
      },
      {
        id: 'usr-2',
        name: 'Alex Mercer',
        email: 'student@college.edu',
        phone: '8765432109',
        role: 'user',
        password: hashedPassword
      },
      {
        id: 'usr-3',
        name: 'Sarah Connor',
        email: 'sarah@college.edu',
        phone: '7654321098',
        role: 'user',
        password: hashedPassword
      }
    ];

    const defaultRegistrations: Registration[] = [
      {
        id: 'reg-1',
        userId: 'usr-2',
        eventId: 'evt-1',
        registrationDate: '2026-06-20T10:30:00Z'
      },
      {
        id: 'reg-2',
        userId: 'usr-2',
        eventId: 'evt-5',
        registrationDate: '2026-06-22T14:15:00Z'
      },
      {
        id: 'reg-3',
        userId: 'usr-3',
        eventId: 'evt-1',
        registrationDate: '2026-06-21T09:45:00Z'
      },
      {
        id: 'reg-4',
        userId: 'usr-3',
        eventId: 'evt-2',
        registrationDate: '2026-06-23T11:20:00Z'
      }
    ];

    const db: DatabaseSchema = {
      users: defaultUsers,
      events: DEFAULT_EVENTS,
      registrations: defaultRegistrations
    };

    saveDatabase(db);
    return db;
  }

  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading database file, resetting to defaults:', error);
    // Return default empty structures or basic seeds
    const db: DatabaseSchema = { users: [], events: DEFAULT_EVENTS, registrations: [] };
    saveDatabase(db);
    return db;
  }
}

export function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// Collection Helpers (mimics MongoDB API)
export const dbStore = {
  users: {
    find: () => {
      return getDatabase().users;
    },
    findOne: (query: Partial<User>) => {
      const users = getDatabase().users;
      return users.find(u => {
        for (const key in query) {
          if (u[key as keyof User] !== query[key as keyof User]) return false;
        }
        return true;
      });
    },
    insertOne: (user: Omit<User, 'id'>) => {
      const db = getDatabase();
      const newUser: User = {
        ...user,
        id: `usr-${Date.now()}`
      };
      db.users.push(newUser);
      saveDatabase(db);
      return newUser;
    },
    updateOne: (id: string, update: Partial<Omit<User, 'id'>>) => {
      const db = getDatabase();
      const idx = db.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...update };
        saveDatabase(db);
        return db.users[idx];
      }
      return null;
    }
  },

  events: {
    find: () => {
      return getDatabase().events;
    },
    findOne: (id: string) => {
      return getDatabase().events.find(e => e.id === id);
    },
    insertOne: (event: Omit<Event, 'id'>) => {
      const db = getDatabase();
      const newEvent: Event = {
        ...event,
        id: `evt-${Date.now()}`
      };
      db.events.push(newEvent);
      saveDatabase(db);
      return newEvent;
    },
    updateOne: (id: string, update: Partial<Omit<Event, 'id'>>) => {
      const db = getDatabase();
      const idx = db.events.findIndex(e => e.id === id);
      if (idx !== -1) {
        db.events[idx] = { ...db.events[idx], ...update };
        saveDatabase(db);
        return db.events[idx];
      }
      return null;
    },
    deleteOne: (id: string) => {
      const db = getDatabase();
      const originalLength = db.events.length;
      db.events = db.events.filter(e => e.id !== id);
      
      // Also cascade delete registrations for this event to maintain relational integrity
      db.registrations = db.registrations.filter(r => r.eventId !== id);
      
      saveDatabase(db);
      return db.events.length < originalLength;
    }
  },

  registrations: {
    find: () => {
      return getDatabase().registrations;
    },
    findMany: (query: Partial<Registration>) => {
      const registrations = getDatabase().registrations;
      return registrations.filter(r => {
        for (const key in query) {
          if (r[key as keyof Registration] !== query[key as keyof Registration]) return false;
        }
        return true;
      });
    },
    insertOne: (registration: Omit<Registration, 'id'>) => {
      const db = getDatabase();
      
      // Create and save registration document
      const newReg: Registration = {
        ...registration,
        id: `reg-${Date.now()}`
      };
      db.registrations.push(newReg);
      
      // Subtract 1 available seat from the registered event
      const eventIdx = db.events.findIndex(e => e.id === registration.eventId);
      if (eventIdx !== -1) {
        if (db.events[eventIdx].availableSeats > 0) {
          db.events[eventIdx].availableSeats -= 1;
        }
      }

      saveDatabase(db);
      return newReg;
    },
    deleteOne: (id: string) => {
      const db = getDatabase();
      const regToDelete = db.registrations.find(r => r.id === id);
      if (!regToDelete) return false;

      // Filter registration out
      db.registrations = db.registrations.filter(r => r.id !== id);

      // Refund 1 available seat back to the event
      const eventIdx = db.events.findIndex(e => e.id === regToDelete.eventId);
      if (eventIdx !== -1) {
        if (db.events[eventIdx].availableSeats < db.events[eventIdx].totalSeats) {
          db.events[eventIdx].availableSeats += 1;
        }
      }

      saveDatabase(db);
      return true;
    }
  }
};
