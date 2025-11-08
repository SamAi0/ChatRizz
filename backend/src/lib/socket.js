import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const allowedSocketOrigins = [];
if (ENV.CLIENT_URL) allowedSocketOrigins.push(ENV.CLIENT_URL);
if (ENV.NODE_ENV !== "production") allowedSocketOrigins.push("http://localhost:5173");

const io = new Server(server, {
  cors: {
    origin: allowedSocketOrigins,
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Store user socket mappings
const userSocketMap = {}; // {userId:socketId}

// Store user group memberships
const userGroups = {}; // {userId: [groupId1, groupId2, ...]}

// Function to add user to a group
export function addUserToGroup(userId, groupId) {
  if (!userGroups[userId]) {
    userGroups[userId] = [];
  }
  if (!userGroups[userId].includes(groupId)) {
    userGroups[userId].push(groupId);
  }
}

// Function to remove user from a group
export function removeUserFromGroup(userId, groupId) {
  if (userGroups[userId]) {
    userGroups[userId] = userGroups[userId].filter(id => id !== groupId);
  }
}

// Function to get all socket IDs for a group
export function getGroupSocketIds(groupId) {
  const socketIds = [];
  for (const [userId, groupIdList] of Object.entries(userGroups)) {
    if (groupIdList.includes(groupId)) {
      const socketId = userSocketMap[userId];
      if (socketId) {
        socketIds.push(socketId);
      }
    }
  }
  return socketIds;
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user?.fullName || socket.id);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // Join user to their groups (this would need to be implemented based on actual group memberships)
  // For now, we'll emit online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for group join event
  socket.on("joinGroup", (groupId) => {
    socket.join(`group-${groupId}`);
    addUserToGroup(userId, groupId);
  });

  // Listen for group leave event
  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group-${groupId}`);
    removeUserFromGroup(userId, groupId);
  });

  // Listen for typing events in groups
  socket.on("groupTyping", ({ groupId, userId }) => {
    socket.to(`group-${groupId}`).emit("groupTyping", { groupId, userId });
  });

  socket.on("groupStopTyping", ({ groupId, userId }) => {
    socket.to(`group-${groupId}`).emit("groupStopTyping", { groupId, userId });
  });

  // with socket.on we listen for events from clients
  socket.on("typing", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) io.to(receiverSocketId).emit("typing", { from: socket.userId });
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) io.to(receiverSocketId).emit("stopTyping", { from: socket.userId });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user?.fullName || socket.id);
    delete userSocketMap[userId];
    delete userGroups[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };