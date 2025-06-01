const api = {
  async fetchWithAuth(url, options = {}) {
    try {
      // Add default headers for authenticated requests
      const response = await fetch(url, {
        ...options,
        credentials: "include", // This ensures cookies are sent
        headers: {
          ...options.headers,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        // Try to refresh the token
        const refreshResponse = await fetch(
          "/backend/routes/auth.php?action=refresh",
          {
            method: "POST",
          }
        );

        if (refreshResponse.ok) {
          // Retry the original request
          return await fetch(url, options);
        } else {
          // Redirect to login
          window.location.href = "/frontend/login";
        }
      }

      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  // Get all messages
  getMessages() {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve(
          [...db.messages].sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }, 800);
    });
  },

  // Get guestbook settings
  getSettings() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...db.settings });
      }, 300);
    });
  },

  // Add a new message
  addMessage(messageData) {
    return new Promise((resolve) => {
      const newMessage = {
        id: generateId(),
        ...messageData,
        date: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        replies: [],
      };

      db.messages.unshift(newMessage);

      setTimeout(() => {
        resolve(newMessage);
      }, 500);
    });
  },

  // Add a reply to a message
  addReply(messageId, replyData) {
    return new Promise((resolve, reject) => {
      const messageIndex = db.messages.findIndex((msg) => msg.id == messageId);

      if (messageIndex === -1) {
        reject(new Error("Message not found"));
        return;
      }

      const newReply = {
        id: generateId(),
        ...replyData,
        date: new Date().toISOString(),
      };

      db.messages[messageIndex].replies.push(newReply);

      setTimeout(() => {
        resolve(newReply);
      }, 500);
    });
  },

  // Update vote count
  updateVote(messageId, voteType, increment) {
    return new Promise((resolve, reject) => {
      const messageIndex = db.messages.findIndex((msg) => msg.id == messageId);

      if (messageIndex === -1) {
        reject(new Error("Message not found"));
        return;
      }

      const message = db.messages[messageIndex];

      if (voteType === "upvote") {
        message.upvotes += increment ? 1 : -1;
      } else if (voteType === "downvote") {
        message.downvotes += increment ? 1 : -1;
      }

      setTimeout(() => {
        resolve({
          upvotes: message.upvotes,
          downvotes: message.downvotes,
        });
      }, 300);
    });
  },
};

// Simulated database with sample messages
const db = {
  messages: [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      message:
        "Just visited the Grand Canyon and it was breathtaking! Anyone else been there recently?",
      profilePic: "/api/placeholder/40/40",
      date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      upvotes: 5,
      downvotes: 1,
      replies: [
        {
          id: 101,
          name: "Bob Smith",
          email: "bob@example.com",
          message:
            "I was there last month! Did you take the Bright Angel Trail?",
          profilePic: "/api/placeholder/30/30",
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ],
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael@example.com",
      message:
        "Planning a trip to Japan next spring. Any recommendations for must-see places in Tokyo?",
      profilePic: "/api/placeholder/40/40",
      date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      upvotes: 8,
      downvotes: 0,
      replies: [],
    },
    {
      id: 3,
      name: "Sarah Williams",
      email: "sarah@example.com",
      message:
        "Just got back from Bali! The beaches were incredible and the local cuisine was amazing. Highly recommend visiting Ubud for the cultural experience.",
      profilePic: "/api/placeholder/40/40",
      date: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      upvotes: 12,
      downvotes: 2,
      replies: [
        {
          id: 102,
          name: "David Lee",
          email: "david@example.com",
          message:
            "I'm heading to Bali next month! Any specific restaurants you'd recommend?",
          profilePic: "/api/placeholder/30/30",
          date: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        },
      ],
    },
  ],
  settings: {
    title: "Travel Adventures",
    owner: "John Doe",
  },
};

// Generate a unique ID
const generateId = () => Math.floor(Math.random() * 10000) + Date.now();

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Export the API and helper functions
window.api = api;
window.formatDate = formatDate;
