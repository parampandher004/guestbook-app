if (!window.Guestbooks) window.Guestbooks = [];
if (!window.currentEditId) window.currentEditId = null;

fetchMyGuestbooks = async function () {
  try {
    const response = await fetch(
      "/backend/routes/guestbook.php?action=my-guestbooks",
      {
        credentials: "include",
      }
    );
    const data = await response.json();
    console.log("My Guestbooks Response:", data);
    if (data.success) {
      window.Guestbooks = data.entries; // Store the guestbooks
      this.displayGuestbooks();
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

updateGuestbook = async function (id, updates) {
  try {
    console.log("Sending update:", { id, ...updates });

    const response = await fetch(
      "/backend/routes/guestbook.php?action=update",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      }
    );

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Response was not JSON");
    }

    const data = await response.json();
    console.log("Update response:", data);

    if (data.success) {
      document.getElementById("editModal").style.display = "none";
      await fetchMyGuestbooks();
    } else {
      console.error("Update failed:", data.message);
    }
  } catch (error) {
    console.error("Error updating guestbook:", error);
  }
};

createGuestbook = async function (data) {
  try {
    const response = await fetch("/backend/routes/guestbook.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (responseData.success) {
      document.getElementById("createModal").style.display = "none";
      await fetchMyGuestbooks();
    } else {
      console.error("Failed to create guestbook:", responseData.message);
    }
  } catch (error) {
    console.error("Error creating guestbook:", error);
  }
};

deleteGuestbook = async function (id) {
  if (!confirm("Are you sure you want to delete this guestbook?")) {
    return;
  }

  try {
    const response = await fetch(`/backend/routes/guestbook.php?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (data.success) {
      await fetchMyGuestbooks();
    } else {
      console.error("Failed to delete guestbook:", data.message);
    }
  } catch (error) {
    console.error("Error deleting guestbook:", error);
  }
};

// Move displayGuestbooks to manager
displayGuestbooks = function () {
  const container = document.getElementById("guestbookList");
  if (!container) {
    console.error("Guestbook list container not found");
    return;
  }

  container.innerHTML = window.Guestbooks.map(
    (gb) => `
        <div class="guestbook-item">
            <div class="guestbook-content" onclick="window.location.href='/frontend/guestbook/${gb.id}'">
                <h3>${gb.title}</h3>
                <p>${gb.description}</p>
                <span class="badge ${gb.visibility}">${gb.visibility}</span>
                <span class="badge ${gb.status}">${gb.status}</span>
            </div>
            <div class="guestbook-actions">
                <button onclick="event.stopPropagation(); editGuestbook('${gb.id}')">Edit</button>
                <button onclick="event.stopPropagation(); deleteGuestbook('${gb.id}')" class="delete-btn">Delete</button>
            </div>
        </div>
    `
  ).join("");
};

editGuestbook = function (id) {
  console.log("Editing guestbook:", id);
  window.currentEditId = id;

  // Convert id to string for comparison since IDs from HTML might be strings
  const guestbook = window.Guestbooks.find((g) => String(g.id) === String(id));

  console.log("Found guestbook:", guestbook);

  if (!guestbook) {
    console.error("Guestbook not found:", id);
    return;
  }

  document.getElementById("editTitle").value = guestbook.title;
  document.getElementById("editDescription").value = guestbook.description;
  document.getElementById("editVisibility").value = guestbook.visibility;
  document.getElementById("editStatus").value = guestbook.status;
  document.getElementById("editModal").style.display = "block";
};

showCreateModal = function () {
  const modal = document.getElementById("createModal");
  if (modal) {
    document.getElementById("createTitle").value = "";
    document.getElementById("createDescription").value = "";
    document.getElementById("createVisibility").value = "public";
    modal.style.display = "block";
  }
};

setupEventListeners = function () {
  const form = document.getElementById("editForm");
  if (form && !form.hasListener) {
    form.hasListener = true;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const updates = {
        title: document.getElementById("editTitle").value,
        description: document.getElementById("editDescription").value,
        visibility: document.getElementById("editVisibility").value,
        status: document.getElementById("editStatus").value,
      };
      await updateGuestbook(currentEditId, updates);
    });
  }

  const createButton = document.getElementById("createGuestbook");
  if (createButton) {
    createButton.addEventListener("click", showCreateModal);
  }

  const createForm = document.getElementById("createForm");
  if (createForm && !createForm.hasListener) {
    createForm.hasListener = true;
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById("createTitle").value,
        description: document.getElementById("createDescription").value,
        visibility: document.getElementById("createVisibility").value,
      };
      await createGuestbook(data);
    });
  }
};

// Initialize on load
this.fetchMyGuestbooks();
this.setupEventListeners();
