import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/dbStore';
import { User, Event, Registration, UserRole, DashboardStats } from './src/types';

// Constants
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-college-event-key';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Log requests in development
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Custom interface for Request with authenticated user info
  interface AuthRequest extends Request {
    user?: {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      phone: string;
    };
  }

  // Auth Middleware
  function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No session token provided.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: UserRole;
        name: string;
        phone: string;
      };
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired session token.' });
    }
  }

  // Admin Verification Middleware
  function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  }

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // POST /api/auth/signup
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All registration fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Check if user already exists
    const existingUser = dbStore.users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // Determine default role (first user might be admin or based on email domain)
      // Standard: default is 'user' unless email matches a seed admin email
      let role: UserRole = 'user';
      if (email.toLowerCase() === 'kanchipatiharika2006@gmail.com' || email.toLowerCase() === 'admin@college.edu') {
        role = 'admin';
      }

      const newUser = dbStore.users.insertOne({
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, phone: newUser.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user without password
      const { password: _, ...safeUser } = newUser;
      res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: safeUser
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error processing signup.' });
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      const user = dbStore.users.findOne({ email: email.toLowerCase() });
      if (!user || !user.password) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...safeUser } = user;
      res.status(200).json({
        message: 'Welcome back!',
        token,
        user: safeUser
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error processing login.' });
    }
  });

  // ==========================================
  // EVENTS ENDPOINTS
  // ==========================================

  // GET /api/events - Retrieve all events
  app.get('/api/events', (req: Request, res: Response) => {
    const events = dbStore.events.find();
    res.json(events);
  });

  // GET /api/events/:id - Get detailed event
  app.get('/api/events/:id', (req: Request, res: Response) => {
    const event = dbStore.events.findOne(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  });

  // POST /api/events - Create new event (Admin only)
  app.post('/api/events', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, description, date, venue, image, totalSeats, category } = req.body;

    if (!title || !description || !date || !venue || !totalSeats) {
      return res.status(400).json({ message: 'Missing required event fields.' });
    }

    const seats = parseInt(totalSeats);
    if (isNaN(seats) || seats <= 0) {
      return res.status(400).json({ message: 'Seats must be a positive number.' });
    }

    const defaultImage = image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80';

    try {
      const newEvent = dbStore.events.insertOne({
        title,
        description,
        date,
        venue,
        image: defaultImage,
        totalSeats: seats,
        availableSeats: seats,
        category: category || 'General'
      });

      res.status(201).json({
        message: 'Event created successfully!',
        event: newEvent
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Server error creating event.' });
    }
  });

  // PUT /api/events/:id - Update event (Admin only)
  app.put('/api/events/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, description, date, venue, image, totalSeats, availableSeats, category } = req.body;

    const event = dbStore.events.findOne(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    try {
      const updateData: Partial<Event> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = date;
      if (venue !== undefined) updateData.venue = venue;
      if (image !== undefined) updateData.image = image;
      if (category !== undefined) updateData.category = category;

      if (totalSeats !== undefined) {
        const parsedTotal = parseInt(totalSeats);
        if (!isNaN(parsedTotal) && parsedTotal > 0) {
          // Adjust available seats proportional to difference
          const diff = parsedTotal - event.totalSeats;
          updateData.totalSeats = parsedTotal;
          updateData.availableSeats = Math.max(0, event.availableSeats + diff);
        }
      }

      if (availableSeats !== undefined) {
        const parsedAvail = parseInt(availableSeats);
        if (!isNaN(parsedAvail) && parsedAvail >= 0) {
          updateData.availableSeats = Math.min(parsedAvail, updateData.totalSeats || event.totalSeats);
        }
      }

      const updated = dbStore.events.updateOne(req.params.id, updateData);
      res.json({
        message: 'Event updated successfully!',
        event: updated
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ message: 'Server error updating event.' });
    }
  });

  // DELETE /api/events/:id - Delete event (Admin only)
  app.delete('/api/events/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const success = dbStore.events.deleteOne(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json({ message: 'Event and related registrations deleted successfully!' });
  });

  // ==========================================
  // REGISTRATIONS ENDPOINTS (Protected)
  // ==========================================

  // POST /api/register - Register a student for an event
  app.post('/api/register', authenticateToken, (req: AuthRequest, res: Response) => {
    const { eventId, studentName, email, phone, collegeName } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    // Use current session user or support custom registration inputs
    const targetUserId = req.user!.id;
    const userEmail = email ? email.toLowerCase() : req.user!.email;

    const event = dbStore.events.findOne(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: 'Sorry, this event is completely sold out.' });
    }

    // Check if already registered
    const existingRegs = dbStore.registrations.findMany({ userId: targetUserId, eventId });
    if (existingRegs.length > 0) {
      return res.status(400).json({ message: 'You have already registered for this event!' });
    }

    try {
      const newRegistration = dbStore.registrations.insertOne({
        userId: targetUserId,
        eventId,
        registrationDate: new Date().toISOString()
      });

      // Optionally update user's name/phone/college details in profile if they submitted custom ones
      if (studentName || phone) {
        dbStore.users.updateOne(targetUserId, {
          name: studentName || req.user!.name,
          phone: phone || req.user!.phone
        });
      }

      res.status(201).json({
        message: 'Registration successful! Seats secured.',
        registration: newRegistration
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error registering for event.' });
    }
  });

  // GET /api/myregistrations - Fetch active registrations of current user
  app.get('/api/myregistrations', authenticateToken, (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const regs = dbStore.registrations.findMany({ userId });
    
    // Populate event details
    const populated = regs.map(r => {
      const eventDetails = dbStore.events.findOne(r.eventId);
      return {
        ...r,
        event: eventDetails
      };
    });

    res.json(populated);
  });

  // DELETE /api/register/:id - Cancel registration (Student/Admin can do this)
  app.delete('/api/register/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    const regId = req.params.id;
    const db = dbStore.registrations.find();
    const registration = db.find(r => r.id === regId);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    // Access control: only the registrant or an admin can delete it
    if (registration.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only cancel your own registrations.' });
    }

    try {
      const success = dbStore.registrations.deleteOne(regId);
      if (success) {
        res.json({ message: 'Registration cancelled successfully. Refunded seat vacancy.' });
      } else {
        res.status(500).json({ message: 'Error deleting registration.' });
      }
    } catch (error) {
      console.error('Cancel registration error:', error);
      res.status(500).json({ message: 'Server error cancelling registration.' });
    }
  });

  // ==========================================
  // ADMIN DASHBOARD ENDPOINTS (Admin only)
  // ==========================================

  // GET /api/admin/users - Get all student users
  app.get('/api/admin/users', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const users = dbStore.users.find();
    // Return users without passwords
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  // GET /api/admin/registrations - Get all registered event records
  app.get('/api/admin/registrations', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const registrations = dbStore.registrations.find();
    
    // Populate user and event details
    const populated = registrations.map(r => {
      const user = dbStore.users.find().find(u => u.id === r.userId);
      const event = dbStore.events.findOne(r.eventId);
      
      const safeUser = user ? { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } : undefined;
      
      return {
        ...r,
        user: safeUser,
        event
      };
    });

    res.json(populated);
  });

  // GET /api/admin/stats - Retrieve metrics and chart data
  app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const users = dbStore.users.find();
    const events = dbStore.events.find();
    const registrations = dbStore.registrations.find();

    const totalStudents = users.filter(u => u.role === 'user').length;
    const totalEventsCount = events.length;
    const totalRegsCount = registrations.length;

    // Calculate filled seats stats
    let grandTotalSeats = 0;
    let grandAvailableSeats = 0;
    
    events.forEach(e => {
      grandTotalSeats += e.totalSeats;
      grandAvailableSeats += e.availableSeats;
    });

    const filledSeats = grandTotalSeats - grandAvailableSeats;
    const seatsFilledPercentage = grandTotalSeats > 0 ? Math.round((filledSeats / grandTotalSeats) * 100) : 0;

    // Registrations grouped by event
    const registrationsByEvent = events.map(evt => {
      const count = registrations.filter(r => r.eventId === evt.id).length;
      return {
        eventTitle: evt.title,
        count,
        seatsFilled: evt.totalSeats - evt.availableSeats,
        totalSeats: evt.totalSeats
      };
    });

    const stats: DashboardStats = {
      totalEvents: totalEventsCount,
      totalRegistrations: totalRegsCount,
      totalUsers: totalStudents,
      seatsFilledPercentage,
      registrationsByEvent
    };

    res.json(stats);
  });

  // PUT /api/profile - Simple profile update endpoint for student users
  app.put('/api/profile', authenticateToken, (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required.' });
    }

    try {
      const updatedUser = dbStore.users.updateOne(userId, { name, phone });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Generate a new token with updated details
      const token = jwt.sign(
        { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name, phone: updatedUser.phone },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...safeUser } = updatedUser;
      res.json({
        message: 'Profile updated successfully!',
        token,
        user: safeUser
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Server error updating profile.' });
    }
  });

  // ==========================================
  // VITE DEV SERVER / PRODUCTION CONFIGURATION
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`Event Registration System (Full Stack) is up & running!`);
    console.log(`Local Access URL: http://localhost:${PORT}`);
    console.log(`Database Seeded: default Admin is active.`);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
