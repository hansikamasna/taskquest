#  TaskQuest — Gamified Collaborative Task Manager

A full-stack MERN application where task management feels like a video game. Projects are **Levels**, tasks are **Missions**, and your team are **Players**.

---

##  Features

-  Game-themed UI with dark neon aesthetic
-  Level Select screen (project roadmap)
-  Kanban Board with drag-and-drop
-  Real-time sync via Socket.io
-  JWT Authentication
-  Team collaboration with member invites
-  Progress bars per project
-  XP system on task completion

---

##  Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React, Tailwind CSS, Framer Motion |
| Drag & Drop| @hello-pangea/dnd       |
| Backend    | Node.js + Express.js    |
| Database   | MongoDB + Mongoose      |
| Auth       | JWT + bcryptjs          |
| Realtime   | Socket.io               |

---

##  Project Structure

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

##  Setup & Installation

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

##  How to Play

1. **Register** a new account (Character Creation)
2. **Login** to enter the Game Lobby
3. **Create a Project** (New Level) from the Dashboard
4. **Click a Project** to enter the Kanban Board
5. **Add Tasks** (Missions) using the "+ MISSION" button
6. **Drag tasks** between columns as work progresses
7. **Invite teammates** using their email
8. **Complete tasks** to earn XP! 

---

##  API Endpoints

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

##  Troubleshooting

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

##  Customization

- **Theme colors**: Edit `client/tailwind.config.js`
- **Columns**: Edit `COLUMNS` array in `BoardPage.jsx`
- **Priorities**: Edit `priorityConfig` in `TaskCard.jsx`
- **Project themes**: Edit `themeConfig` in `ProjectCard.jsx`

---

## Screenshots
<img width="1912" height="1001" alt="Screenshot 2026-06-19 155803" src="https://github.com/user-attachments/assets/acee5186-27c2-48b3-8cc2-febb2de5d05c" />
<img width="1913" height="961" alt="Screenshot 2026-06-19 155831" src="https://github.com/user-attachments/assets/3a41e26a-1bad-405c-8402-71355b2733f1" />
<img width="1911" height="956" alt="Screenshot 2026-06-19 155928" src="https://github.com/user-attachments/assets/8f2b7828-df39-4cd2-a98a-ae4e909a6d9c" />
<img width="1907" height="945" alt="Screenshot 2026-06-19 155953" src="https://github.com/user-attachments/assets/6d7bfe8d-d26a-4f81-afba-b31046328b68" />
<img width="1808" height="663" alt="Screenshot 2026-06-19 160012" src="https://github.com/user-attachments/assets/497b576d-97c0-4479-afdf-7e6fd1615b1e" />
<img width="1911" height="951" alt="Screenshot 2026-06-19 160033" src="https://github.com/user-attachments/assets/b2b2da4c-c147-4ee5-9706-d7ddb1944c51" />
<img width="1907" height="952" alt="Screenshot 2026-06-19 160050" src="https://github.com/user-attachments/assets/2acd64f6-2d21-4490-b6e6-59042f4ad3f0" />
<img width="1907" height="953" alt="Screenshot 2026-06-19 160129" src="https://github.com/user-attachments/assets/3235b1f3-f25a-43ce-81d2-fd79961214ed" />
<img width="1907" height="946" alt="Screenshot 2026-06-19 160151" src="https://github.com/user-attachments/assets/a68cc6c8-a98b-4f96-9f99-36636d6346a8" />






