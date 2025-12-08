# MenuCraft - Restaurant Menu Manager

A simple restaurant menu management application used as a sample project for [CloudLearn](https://labs.cloudlearn.io) hands-on labs.

## Overview

MenuCraft is a two-tier application consisting of:

- **Frontend:** Express.js server serving static HTML/CSS/JS (Port 8080)
- **Backend:** Express.js REST API with in-memory storage (Port 3000)

## Project Structure
```
menucraft/
├── frontend/
|   |── Dockerfile
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── backend/
    |── Dockerfile
    ├── server.js
    └── package.json
```

## Running Locally

### Backend
```bash
cd backend
npm install
npm start
```

Backend runs at: http://localhost:3001

### Frontend
```bash
cd frontend
npm install
BACKEND_API_URL=http://localhost:3001 npm start
```

Frontend runs at: http://localhost:8081

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/menu | Get all menu items |
| GET | /api/menu/:id | Get single menu item |
| POST | /api/menu | Create menu item |
| PUT | /api/menu/:id | Update menu item |
| DELETE | /api/menu/:id | Delete menu item |

## Labs Using This Application

- [Containerize and Deploy MenuCraft to Azure Container Apps](https://labs.cloudlearn.io)

This project is for educational purposes as part of [CloudLearn](https://labs.cloudlearn.io) labs.