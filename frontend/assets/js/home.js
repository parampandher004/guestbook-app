const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    searchEntries(this.value);
  });
}

const guestbooks = [
  {
    id: 1,
    title: "Family Trip 2024",
    description: "Memories from our amazing family vacation.",
  },
  {
    id: 2,
    title: "Friends Getaway - Beach House",
    description: "Fun times with my closest friends at the beach.",
  },
  {
    id: 3,
    title: "Work Retreat - Innovation Hub",
    description: "Brainstorming and team building at the company retreat.",
  },
  {
    id: 4,
    title: "Birthday Celebration",
    description: "Celebrating another year with loved ones.",
  },
];

function searchEntries(query) {
  const filtered = guestbookEntries.filter((entry) =>
    entry.toLowerCase().includes(query.toLowerCase())
  );
  showGuestbookEntries(filtered);
}

function showGuestbookEntries() {
  console.log("Showing guestbook entries");
  const container = document.getElementById("guestbookentries");
  if (!container) {
    console.warn("guestbookentries container not found");
    return;
  }
  container.innerHTML = "";
  guestbooks.forEach((guestbook) => {
    const card = document.createElement("div");
    card.className = "guestbook-card";

    const title = document.createElement("h3");
    title.textContent = guestbook.title;
    title.style.cursor = "pointer";
    title.addEventListener("click", () => {
      console.log(`Navigating to guestbook with ID: ${guestbook.id}`);
    });

    const description = document.createElement("p");
    description.textContent = guestbook.description;

    card.appendChild(title);
    card.appendChild(description);
    container.appendChild(card);
  });
}
