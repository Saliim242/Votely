# Real-Time Voting with Socket.IO in Votely

This document explains how the real-time voting feature works in Votely and how to implement it in your frontend application.

## Overview

Votely uses Socket.IO to provide real-time updates when votes are cast or deleted. This allows for a dynamic user experience where vote counts update instantly without requiring page refreshes.

## Server-Side Implementation

The server-side implementation consists of:

1. Socket.IO server setup in `server.js`
2. Real-time event emissions in the vote controller
3. Room-based broadcasting for targeted updates

### Socket.IO Server Setup

The Socket.IO server is initialized in `server.js` and made available to route handlers:

```javascript
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
```

### Socket.IO Event Handlers

The server sets up event handlers for client connections:

```javascript
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
```

### Real-Time Event Emissions

In the vote controller (`vote.controller.js`), events are emitted when votes are cast or deleted:

```javascript
// When a vote is cast
if (req.app.get("io")) {
  const io = req.app.get("io");

  // Emit to election room
  io.to(`election-${electionId}`).emit("vote-cast", {
    electionId,
    candidateId,
    votesCount: candidate.votesCount,
  });

  // Emit to admin room for monitoring
  io.to("admin-room").emit("new-vote", {
    vote: {
      id: vote._id,
      electionId,
      candidateId,
      userId: req.user.id,
      votedAt: vote.votedAt,
    },
  });
}
```

## Client-Side Implementation

A sample client-side implementation is provided in `client-example.js`. Here's how to implement real-time voting in your frontend:

### 1. Install Socket.IO Client

If you're using a module bundler (webpack, rollup, etc.):

```bash
npm install socket.io-client
```

Or include it via CDN:

```html
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
```

### 2. Connect to the Socket.IO Server

```javascript
const socket = io("http://localhost:5001", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});
```

### 3. Join Election Room

When a user views an election, join the corresponding room:

```javascript
function joinElectionRoom(electionId) {
  socket.emit("join-election", electionId);
  console.log(`Joined election room: election-${electionId}`);
}
```

### 4. Listen for Vote Events

```javascript
// Listen for vote cast events
socket.on("vote-cast", (data) => {
  console.log("New vote cast:", data);

  // Update UI with new vote count
  updateCandidateVoteCount(data.candidateId, data.votesCount);

  // Show notification
  showNotification("New vote cast!");
});
```

### 5. Update UI

Create functions to update your UI when vote events are received:

```javascript
function updateCandidateVoteCount(candidateId, newCount) {
  // Find the candidate element in the DOM
  const candidateElement = document.querySelector(
    `[data-candidate-id="${candidateId}"]`
  );
  if (candidateElement) {
    // Update the vote count display
    const voteCountElement = candidateElement.querySelector(".vote-count");
    if (voteCountElement) {
      voteCountElement.textContent = newCount;

      // Add animation to highlight the change
      voteCountElement.classList.add("vote-updated");
      setTimeout(() => {
        voteCountElement.classList.remove("vote-updated");
      }, 1500);
    }
  }
}
```

## Admin Features

Admins can receive additional real-time updates:

```javascript
// Admin users can join admin room for monitoring all votes
function joinAdminRoom() {
  // Check if user is admin before joining
  if (isUserAdmin()) {
    socket.emit("join-admin-room");
    console.log("Joined admin room for monitoring");
  }
}

// Admin-specific events
socket.on("new-vote", (data) => {
  console.log("Admin notification - New vote:", data);

  // Update admin dashboard
  addVoteToAdminDashboard(data.vote);
});
```

## Best Practices

1. **Authentication**: Ensure that users can only join rooms they have access to.
2. **Error Handling**: Implement proper error handling for socket connections.
3. **Reconnection**: Handle reconnection scenarios gracefully.
4. **Clean Up**: Leave rooms when no longer needed to prevent memory leaks.

```javascript
// When leaving an election page
function leaveElectionRoom(electionId) {
  socket.emit("leave-election", electionId);
}

// When component unmounts or page changes
function cleanupSocketConnection() {
  socket.off("vote-cast");
  socket.off("vote-deleted");
  socket.off("new-vote");
}
```

## Testing Real-Time Functionality

To test the real-time functionality:

1. Open multiple browser windows/tabs
2. Log in as different users in each window
3. Navigate to the same election in each window
4. Cast a vote in one window
5. Observe the vote count updating in real-time in all windows

## Troubleshooting

- **Connection Issues**: Ensure CORS is properly configured on both server and client
- **Events Not Firing**: Check that you're joining the correct rooms
- **Updates Not Showing**: Verify that your UI update functions are working correctly

For more detailed examples, refer to the `client-example.js` file.
