const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoute = require("./Routes/AuthRoutes");
const taskRoute = require("./Routes/TaskRoute");
const dashboardRoute = require("./Routes/DashboardRoute");

const { MONGO_URL, PORT } = process.env;

const app = express();

mongoose
    .connect(MONGO_URL)
    .then(() => console.log("MongoDB is connected successfully"))
    .catch((err) => console.log(err));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/", authRoute);

app.use("/api/tasks", taskRoute);

app.use("/api/dashboard", dashboardRoute);

// Socket.io Setup
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store active users: { userId: { name, color, socketId } }
let activeUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // USER JOINS WHITEBOARD
  socket.on("user-join", ({ userId, name, color }) => {
    activeUsers[userId] = { name, color, socketId: socket.id };

    // Send user list to EVERYONE
    io.emit("active-users", activeUsers);

    console.log("User joined:", name);
  });

  // USER CURSOR MOVEMENT
  socket.on("cursor-move", (data) => {
    // Send cursor position to ALL except self
    socket.broadcast.emit("cursor-move", data);
  });

  // REAL-TIME DRAWING
  socket.on("whiteboard-draw", (data) => {
    socket.broadcast.emit("whiteboard-draw", data);
  });

  // USER LEAVES MANUALLY
  socket.on("user-leave", ({ userId }) => {
    delete activeUsers[userId];
    io.emit("active-users", activeUsers);
  });

  // SOCKET DISCONNECT
  socket.on("disconnect", () => {
    // Find which user disconnected
    const uid = Object.keys(activeUsers).find(
      (id) => activeUsers[id].socketId === socket.id
    );

    if (uid) {
      console.log("User disconnected:", activeUsers[uid].name);
      delete activeUsers[uid];

      // Update client lists
      io.emit("active-users", activeUsers);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
