# Real-Time Collaborative Whiteboard 🖊️

A real-time collaborative whiteboard application that allows multiple users to draw simultaneously on a shared canvas with live synchronization.

This project focuses on real-time systems, WebSockets, canvas manipulation, and multi-user collaboration using Socket.io and Fabric.js.

---

## Features

- Real-time multi-user drawing
- Live canvas synchronization across clients
- Undo / Redo functionality
- Brush color and size controls
- Multi-user cursor tracking (work in progress)
- Active users presence system
- WebSocket-based communication using Socket.io

---

## Tech Stack

### Frontend
- React (Vite)
- Fabric.js (`fabric-pure-browser`)
- Socket.io Client
- CSS

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB (for user/session data)

### How to run locally
-```bash
- cd Backend
- npm install
- npm start
- cd Frontend
- npm install
- npm run dev

### Create a .env file inside backend
- MONGO_URL=your_mongodb_connection_string
- PORT=8080


