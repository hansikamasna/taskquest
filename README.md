# 🎮 TaskQuest — Gamified Collaborative Task Manager

A full-stack MERN application where task management feels like a video game. Projects are **Levels**, tasks are **Missions**, and your team are **Players**.

---

## ✨ Features

- 🎮 Game-themed UI with dark neon aesthetic
- 🗺️ Level Select screen (project roadmap)
- 📋 Kanban Board with drag-and-drop
- ⚡ Real-time sync via Socket.io
- 🔐 JWT Authentication
- 👥 Team collaboration with member invites
- 📊 Progress bars per project
- 🏆 XP system on task completion

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React, Tailwind CSS, Framer Motion |
| Drag & Drop| @hello-pangea/dnd       |
| Backend    | Node.js + Express.js    |
| Database   | MongoDB + Mongoose      |
| Auth       | JWT + bcryptjs          |
| Realtime   | Socket.io               |

---

## 📁 Project Structure

```
taskquest/
├── client/               # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   ├── board/    # Kanban, Task cards, Modals
│       │   ├── layout/   # Navbar
│       │   └── ui/
│       ├── context/      # Auth context
│       ├── hooks/
│       ├── pages/        # Landing, Login, Register, Dashboard, Board
│       └── services/     # API calls + Socket
└── server/               # Express backend
    ├── controllers/
    ├── middleware/
    ├── models/           # User, Project, Task
    ├── routes/
    └── index.js
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v16+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

### 1. Clone / Unzip the project

```bash
cd taskquest
```

---

### 2. Set up the Backend (Server)

```bash
cd server
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskquest
JWT_SECRET=your_super_secret_key_here_make_it_long
CLIENT_URL=http://localhost:3000
```

> **MongoDB Atlas**: Replace `MONGO_URI` with your Atlas connection string.

Start the server:
```bash
npm run dev      # Development (with nodemon)
# or
npm start        # Production
```

Server runs at: `http://localhost:5000`

---

### 3. Set up the Frontend (Client)

Open a new terminal:

```bash
cd client
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

`.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the React app:
```bash
npm start
```

App runs at: `http://localhost:3000`

---

## 🎮 How to Play

1. **Register** a new account (Character Creation)
2. **Login** to enter the Game Lobby
3. **Create a Project** (New Level) from the Dashboard
4. **Click a Project** to enter the Kanban Board
5. **Add Tasks** (Missions) using the "+ MISSION" button
6. **Drag tasks** between columns as work progresses
7. **Invite teammates** using their email
8. **Complete tasks** to earn XP! ⚡

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|----------------------|-------------------|
| POST   | `/api/auth/register`  | Register new user |
| POST   | `/api/auth/login`     | Login user        |
| GET    | `/api/auth/me`        | Get current user  |

### Projects
| Method | Endpoint                    | Description          |
|--------|----------------------------|----------------------|
| GET    | `/api/projects`             | Get all projects     |
| POST   | `/api/projects`             | Create project       |
| GET    | `/api/projects/:id`         | Get single project   |
| POST   | `/api/projects/:id/invite`  | Invite member        |
| DELETE | `/api/projects/:id`         | Delete project       |

### Tasks
| Method | Endpoint                        | Description        |
|--------|---------------------------------|--------------------|
| GET    | `/api/tasks/project/:projectId` | Get project tasks  |
| POST   | `/api/tasks`                    | Create task        |
| PATCH  | `/api/tasks/:id/status`         | Update task status |
| PUT    | `/api/tasks/:id`                | Update task        |
| DELETE | `/api/tasks/:id`                | Delete task        |

---

## 🔧 Troubleshooting

**MongoDB connection failed?**
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas with the correct connection string

**Port already in use?**
- Change `PORT` in server `.env`
- Change port in `client/package.json` proxy field

**Socket not connecting?**
- Ensure `REACT_APP_SOCKET_URL` matches your server URL
- Check CORS settings in `server/index.js`

---

## 🎨 Customization

- **Theme colors**: Edit `client/tailwind.config.js`
- **Columns**: Edit `COLUMNS` array in `BoardPage.jsx`
- **Priorities**: Edit `priorityConfig` in `TaskCard.jsx`
- **Project themes**: Edit `themeConfig` in `ProjectCard.jsx`

---

Built with ❤️ and ⚡ — TaskQuest
