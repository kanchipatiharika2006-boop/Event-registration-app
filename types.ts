/**
 * Shared Type Definitions for the Event Registration System
 */

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string; // Kept hidden/optional in frontend
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String or YYYY-MM-DD
  venue: string;
  image: string;
  availableSeats: number;
  totalSeats: number;
  category?: string; // For event filtering
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registrationDate: string; // ISO string
  
  // Populated fields for rich UI displays
  event?: Event;
  user?: Omit<User, 'password'>;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  seatsFilledPercentage: number;
  registrationsByEvent: {
    eventTitle: string;
    count: number;
    seatsFilled: number;
    totalSeats: number;
  }[];
}
