const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    searchEntries(this.value);
  });
}

async function fetchGuestbooks() {
  try {
    const response = await fetch(
      "http://localhost/backend/routes/guestbook.php",
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (data.success) {
      fetchGuestbooks = data.entries;
      showGuestbookEntries();
    } else {
      console.error("Failed to fetch guestbooks:", data.message);
    }
  } catch (error) {
    console.error("Error fetching guestbooks:", error);
  }
}

function searchEntries(query) {
  const filtered = fetchGuestbooks.filter(
    (entry) =>
      entry.title.toLowerCase().includes(query.toLowerCase()) ||
      entry.description.toLowerCase().includes(query.toLowerCase())
  );
  showGuestbookEntries(filtered);
}

function showGuestbookEntries(entriesToShow = fetchGuestbooks) {
  console.log("Showing guestbook entries");
  const container = document.getElementById("guestbookentries");
  if (!container) {
    console.warn("guestbookentries container not found");
    return;
  }

  container.innerHTML = "";
  entriesToShow.forEach((guestbook) => {
    const card = document.createElement("div");
    card.className = "guestbook-card";

    const title = document.createElement("h3");
    title.textContent = guestbook.title;
    title.style.cursor = "pointer";
    title.addEventListener("click", () => {
      localStorage.setItem("currentGuestbook", JSON.stringify(guestbook));
      page(`/frontend/guestbook/${guestbook.id}`);
    });

    const description = document.createElement("p");
    description.textContent = guestbook.description;

    const metadata = document.createElement("div");
    metadata.className = "metadata";
    metadata.textContent = `Created by ${guestbook.creator_name} on ${new Date(
      guestbook.created_at
    ).toLocaleDateString()}`;

    const visibility = document.createElement("span");
    visibility.className = `visibility-badge ${guestbook.visibility}`;
    visibility.textContent = guestbook.visibility;

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(metadata);
    card.appendChild(visibility);
    container.appendChild(card);
  });
}

fetchGuestbooks();
