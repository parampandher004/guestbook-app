const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    searchEntries(this.value);
  });
}

const guestbookEntries = [
  "John: Great app!",
  "Jane: I love guestbooks!",
  "Alice: Wonderful experience!",
  "Bob: Could be improved!",
];

function showGuestbookEntries(entries = guestbookEntries) {
  const container = document.getElementById("guestbookentries");
  if (container) {
    container.innerHTML = "";
    entries.forEach((entry) => {
      const p = document.createElement("p");
      p.textContent = entry;
      container.appendChild(p);
    });
  }
}

function searchEntries(query) {
  const filtered = guestbookEntries.filter((entry) =>
    entry.toLowerCase().includes(query.toLowerCase())
  );
  showGuestbookEntries(filtered);
}
