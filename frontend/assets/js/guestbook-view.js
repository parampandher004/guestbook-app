async function fetchMessages(guestbookId) {
  try {
    const response = await fetch(
      `http://localhost/backend/routes/messages.php?guestbook_id=${guestbookId}`,
      {
        credentials: "include",
      }
    );
    const data = await response.json();

    if (data.success) {
      displayMessages(data.messages);
    } else {
      console.error("Failed to fetch messages:", data.message);
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

function displayMessages(messages) {
  const messageList = document.getElementById("message-list");
  if (!messageList) return;

  messageList.innerHTML = "";
  const messageTemplate = document.getElementById("message-template");
  const replyTemplate = document.getElementById("reply-template");

  messages.forEach((message) => {
    const messageClone = messageTemplate.content.cloneNode(true);

    // Fill message template
    messageClone.querySelector(".message-author").textContent = message.name;
    messageClone.querySelector(".message-time").textContent = new Date(
      message.created_at
    ).toLocaleString();
    messageClone.querySelector(".message-content").textContent =
      message.message;

    // Add replies if they exist
    if (message.replies && message.replies.length > 0) {
      const repliesContainer = messageClone.querySelector(".replies");
      message.replies.forEach((reply) => {
        const replyClone = replyTemplate.content.cloneNode(true);
        replyClone.querySelector(".reply-author").textContent = reply.name;
        replyClone.querySelector(".reply-time").textContent = new Date(
          reply.created_at
        ).toLocaleString();
        replyClone.querySelector(".reply-content").textContent =
          reply.reply_text;
        repliesContainer.appendChild(replyClone);
      });
    }

    // Set message card ID for reply functionality
    const messageCard = messageClone.querySelector(".message-card");
    messageCard.setAttribute("data-message-id", message.id);

    messageList.appendChild(messageClone);
  });
}

function showReplyForm(messageId) {
  const replyForm = document.createElement("div");
  replyForm.className = "reply-form";
  replyForm.innerHTML = `
        <form onsubmit="submitReply(event, '${messageId}')">
            <input type="text" name="name" placeholder="Your Name" required>
            <textarea name="reply" placeholder="Your Reply" required></textarea>
            <button type="submit">Submit Reply</button>
        </form>
    `;

  const messageCard = document.querySelector(
    `[data-message-id="${messageId}"]`
  );
  messageCard.appendChild(replyForm);
}

async function submitReply(event, messageId) {
  event.preventDefault();
  const form = event.target;
  const data = {
    message_id: messageId,
    name: form.name.value,
    reply_text: form.reply.value,
  };

  try {
    const response = await fetch("/backend/routes/messages.php?action=reply", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const guestbookId = new URLSearchParams(window.location.search).get("id");
      await fetchMessages(guestbookId);
    }
  } catch (error) {
    console.error("Error submitting reply:", error);
  }
}

// Add back button functionality
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "/frontend/guestbook";
});
