# DPTS - React (Vite) + MongoDB Cloud Full-Stack Application

A modern full-stack web application structure with a **React + Vite (JavaScript)** frontend and an **Express + Node.js** backend configured for **MongoDB Cloud (Atlas)**.

## Project Structure

```
DPTS/
├── client/                     # Frontend (React + Vite + JavaScript)
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/             # Static assets (images, svg, fonts)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── ItemList.jsx
│   │   ├── context/            # React Context state management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page/route components
│   │   │   └── Home.jsx
│   │   ├── services/           # API communication (Axios client)
│   │   │   └── api.js
│   │   ├── utils/              # Helper functions & utilities
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB Cloud (Atlas) connection
│   ├── controllers/            # Route controllers
│   │   └── itemController.js
│   ├── models/                 # Mongoose schema & models
│   │   └── Item.js
│   ├── routes/                 # Express API routes
│   │   └── itemRoutes.js
│   ├── middleware/             # Custom middlewares (e.g. error handling)
│   │   └── errorHandler.js
│   ├── .env.example            # MongoDB Atlas connection string template
│   ├── package.json
│   └── server.js
├── .gitignore
├── package.json                # Root package.json to run both client and server
└── README.md
```

## Quick Start

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
Or install in each folder individually:
```bash
# In client:
cd client
npm install

# In server:
cd ../server
npm install
```

### 2. Configure MongoDB Cloud (Atlas)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a database/cluster.
2. Under **Database** -> **Connect** -> **Connect your application**, copy your MongoDB URI connection string.
3. In `server/`, create a `.env` file (copy from `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dpts_db?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your Atlas credentials.

### 3. Run Development Servers
From the root directory:
```bash
npm run dev
```
This runs both:
- **Client (React + Vite)**: `http://localhost:5173`
- **Server (Express + MongoDB)**: `http://localhost:5000`
