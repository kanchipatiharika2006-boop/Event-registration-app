# VS Code Local Setup Guide - Event Registration System

Follow these steps to run the Event Registration System locally in **VS Code** with a real **MongoDB** database!

---

## Prerequisites

Ensure you have the following installed on your computer:
1. **Node.js** (v18 or higher recommended)
2. **npm** (comes bundled with Node.js)
3. **MongoDB Community Server** (running locally on port `27017` or a cloud-hosted MongoDB Atlas URI)
4. **VS Code** with the **TypeScript** and **Tailwind CSS** extensions (optional but recommended)

---

## Step 1: Open Project in VS Code

1. Extract the downloaded ZIP export or clone the repository to your local folder.
2. Launch VS Code.
3. Select **File > Open Folder...** and choose the project's root directory containing `package.json`.

---

## Step 2: Install Local Dependencies

Open the integrated terminal in VS Code (`Ctrl + ` ` ` or `Cmd + ` ` `) and run:

```bash
npm install
```

This will download and install all standard and dev dependencies, including `express`, `react`, `vite`, `bcryptjs`, and `jsonwebtoken`.

---

## Step 3: Install MongoDB Driver (Mongoose)

If you plan to use a real MongoDB database rather than our robust, pre-configured file-based store, run the following command to add Mongoose:

```bash
npm install mongoose @types/mongoose
```

---

## Step 4: Configure Local Environment Variables

1. Duplicate the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open the newly created `.env` file and supply a custom **JWT Secret** and **MongoDB URI**:

```env
# Port on which the Express server will run locally
PORT=3000

# Secret key used to encrypt student login sessions
JWT_SECRET="write-your-own-secure-long-random-key"

# Your Local or Atlas MongoDB Connection URI
MONGODB_URI="mongodb://localhost:27017/college_events"
```

---

## Step 5: Connecting Mongoose in `server.ts`

To transition the file-based store to your real MongoDB instance, make a slight change inside `/server.ts` (or our database layer):

1. Import mongoose in `server.ts`:
   ```typescript
   import mongoose from 'mongoose';
   ```
2. Before calling `startServer()`, add the connection wrapper:
   ```typescript
   if (process.env.MONGODB_URI) {
     mongoose.connect(process.env.MONGODB_URI)
       .then(() => console.log('Successfully connected to MongoDB!'))
       .catch(err => console.error('MongoDB Connection Error:', err));
   }
   ```

---

## Step 6: Launch Development Server

Start the full-stack development workspace (Express + Vite running simultaneously on port `3000`):

```bash
npm run dev
```

You will see the console log:
```
====================================================
Event Registration System (Full Stack) is up & running!
Local Access URL: http://localhost:3000
====================================================
```

Open **`http://localhost:3000`** in your browser to access the application!

---

## Step 7: Accessing Pre-seeded Demo Accounts

Use the following pre-seeded demo credentials to test the application immediately:

- **Admin Account**:
  - **Email**: `kanchipatiharika2006@gmail.com`
  - **Password**: `admin123`
- **Student Account**:
  - **Email**: `student@college.edu`
  - **Password**: `student123`

---

## Production Build & Run

To compile the application into a production bundle and run the high-performance compiled server:

1. **Compile**:
   ```bash
   npm run build
   ```
   *This compiles the React SPA assets to static files inside `/dist`, and bundles the TypeScript Express server into a standalone CommonJS bundle at `/dist/server.cjs`.*

2. **Launch Production Server**:
   ```bash
   npm run start
   ```
