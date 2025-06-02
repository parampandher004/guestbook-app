let Guestbooks = []; // Move to outer scope
let currentEditId = null;

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
      Guestbooks = data.entries; // Store the guestbooks
      this.displayGuestbooks();
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

updateGuestbook = async function (id, updates) {
  try {
    const response = await fetch(
      "/backend/routes/guestbook.php?action=update",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      }
    );
    const data = await response.json();
    if (data.success) {
      fetchMyGuestbooks(); // Refresh list
      closeModal();
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Move displayGuestbooks to manager
displayGuestbooks = function () {
  const container = document.getElementById("guestbookList");
  if (!container) {
    console.error("Guestbook list container not found");
    return;
  }

  container.innerHTML = Guestbooks.map(
    (gb) => `
                <div class="guestbook-item">
                    <h3>${gb.title}</h3>
                    <p>${gb.description}</p>
                    <span class="badge ${gb.visibility}">${gb.visibility}</span>
                    <span class="badge ${gb.status}">${gb.status}</span>
                    <button onclick="editGuestbook('${gb.id}')">Edit</button>
                </div>
            `
  ).join("");
};

editGuestbook = function (id) {
  currentEditId = id;
  const guestbook = Guestbooks.find((g) => g.id === id);
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
};

// Initialize on load
this.fetchMyGuestbooks();
this.setupEventListeners();
