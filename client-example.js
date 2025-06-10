// Client-side example for Socket.IO integration with Votely
// This is a simple example to demonstrate how to connect to the Socket.IO server
// and receive real-time vote updates

// In a real application, this would be integrated into your frontend framework (React, Vue, Angular, etc.)

// ========== SOCKET.IO CLIENT SETUP ==========

// 1. Include Socket.IO client in your HTML
// <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

// 2. Connect to the Socket.IO server
const socket = io("http://localhost:5001", {
  withCredentials: true,
  // Add any additional options as needed
});

// ========== CONNECTION EVENTS ==========

// Handle connection
socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);

  // After authentication, join specific rooms
  // For example, after user logs in and views an election
  const userToken = localStorage.getItem("token"); // Get auth token
  const userId = getUserIdFromToken(userToken); // Extract user ID from token

  // Join election room when viewing an election
  function joinElectionRoom(electionId) {
    socket.emit("join-election", electionId);
    console.log(`Joined election room: election-${electionId}`);
  }

  // Admin users can join admin room for monitoring all votes
  function joinAdminRoom() {
    // Check if user is admin before joining
    if (isUserAdmin()) {
      socket.emit("join-admin-room");
      console.log("Joined admin room for monitoring");
    }
  }
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// Handle connection errors
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

// ========== VOTE EVENTS ==========

// Listen for vote cast events
socket.on("vote-cast", (data) => {
  console.log("New vote cast:", data);

  // Update UI with new vote count
  updateCandidateVoteCount(data.candidateId, data.votesCount);

  // Show notification
  showNotification("New vote cast!");
});

// Listen for vote deleted events (admin feature)
socket.on("vote-deleted", (data) => {
  console.log("Vote deleted:", data);

  // Update UI with new vote count
  updateCandidateVoteCount(data.candidateId, data.votesCount);
});

// Admin-specific events
socket.on("new-vote", (data) => {
  console.log("Admin notification - New vote:", data);

  // Update admin dashboard
  addVoteToAdminDashboard(data.vote);
});

// ========== HELPER FUNCTIONS ==========

// Example function to update candidate vote count in UI
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

// Example function to show a notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "vote-notification";
  notification.textContent = message;

  // Add to DOM
  document.body.appendChild(notification);

  // Remove after animation
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// Example function to add vote to admin dashboard
function addVoteToAdminDashboard(vote) {
  const adminDashboard = document.getElementById("admin-votes-list");
  if (adminDashboard) {
    const voteItem = document.createElement("li");
    voteItem.className = "vote-item new";
    voteItem.dataset.voteId = vote.id;
    voteItem.innerHTML = `
      <span>Election: ${vote.electionId}</span>
      <span>Candidate: ${vote.candidateId}</span>
      <span>User: ${vote.userId}</span>
      <span>Time: ${new Date(vote.votedAt).toLocaleString()}</span>
    `;

    adminDashboard.prepend(voteItem);

    // Highlight new vote
    setTimeout(() => {
      voteItem.classList.remove("new");
    }, 2000);
  }
}

// Example function to extract user ID from JWT token
function getUserIdFromToken(token) {
  if (!token) return null;

  try {
    // In a real app, you would use a proper JWT decoder
    // This is a simplified example
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload).id;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Example function to check if user is admin
function isUserAdmin() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // Similar to getUserIdFromToken, but checking for role
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload).role === "Admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// ========== EXAMPLE CSS ==========

// Add this to your CSS file
/*
.vote-count {
  transition: background-color 0.5s ease;
}

.vote-updated {
  background-color: #ffff99;
  animation: pulse 1.5s ease;
}

@keyframes pulse {
  0% { background-color: #ffff99; }
  100% { background-color: transparent; }
}

.vote-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  animation: slideIn 0.5s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.fade-out {
  animation: fadeOut 0.5s ease forwards;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.vote-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.5s ease;
}

.vote-item.new {
  background-color: #e6f7ff;
}
*/
