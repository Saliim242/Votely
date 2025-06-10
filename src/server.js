import express from "express";
import color from "colors";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// Routers

import authRouter from "./authentications/auth.route.js";
import userRouter from "./users/user.route.js";
import candidateRouter from "./candidates/candidate.route.js";
import electionRouter from "./elections/elections.route.js";
import voteRouter from "./votes/vote.route.js";

// imort { errorHandler } from "./middlewares/errorHandler.js";
import { globalErrorHandler } from "./utils/error.handle.js";

import { connectDb } from "./config/db.config.js";

dotenv.config();
// Call Connection DB
connectDb();
const app = express();

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Make io accessible to route handlers
app.set("io", io);

// Middlewars
// cors middleware to allow cross origin requests to the server
app.use(cors());
// helmet middleware to secure the server by setting various HTTP headers
app.use(helmet());
// helmet middleware to set the cross-origin resource policy to cross-origin
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// morgan middleware to log HTTP requests and responses to the console
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}
// express middleware to parse JSON and URL-encoded bodies of incoming requests
app.use(express.json());
// express middleware to parse URL-encoded bodies of incoming requests with extended syntax
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routers

// Authentication Router
app.use("/api/auth", authRouter);

// User Router
app.use("/api/users", userRouter);

// Candidate Router
app.use("/api/candidates", candidateRouter);

// Election Router
app.use("/api/elections", electionRouter);

// Vote Router
app.use("/api/votes", voteRouter);

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Welcome to the server",
  });
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join election room for real-time updates
  socket.on("join-election", (electionId) => {
    socket.join(`election-${electionId}`);
    console.log(
      `User ${socket.id} joined election room: election-${electionId}`
    );
  });

  // Admin users can join admin room for monitoring
  socket.on("join-admin-room", () => {
    socket.join("admin-room");
    console.log(`Admin ${socket.id} joined admin room`);
  });

  // Leave election room
  socket.on("leave-election", (electionId) => {
    socket.leave(`election-${electionId}`);
    console.log(`User ${socket.id} left election room: election-${electionId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// global error middleware
app.use(globalErrorHandler);

// app.use((req, res) => {
//   return res.status(404).json({
//     status: false,
//     message: "The Path you are looking for does not exist",
//   });
// });

const PORT = process.env.PORT || 5001;

// Use httpServer instead of app.listen
httpServer.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`.yellow
      .bold
  );
});

// Handle unhandled promise rejections and shut down the server gracefully
// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION! 💥 Shutting down...");
//   console.log(err.name, err.message);
//   httpServer.close(() => {
//     process.exit(1);
//   });
// });
