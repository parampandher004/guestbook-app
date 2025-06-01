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
  const template = document.getElementById("message-template");

  messages.forEach((message) => {
    const messageElement = template.content.cloneNode(true);

    messageElement.querySelector(".message-author").textContent = message.name;
    messageElement.querySelector(".message-time").textContent = new Date(
      message.created_at
    ).toLocaleString();
    messageElement.querySelector(".message-content").textContent =
      message.message;

    // Add the message element to the list
    messageList.appendChild(messageElement);
  });
}
