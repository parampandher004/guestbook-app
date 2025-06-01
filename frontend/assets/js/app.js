const app = document.getElementById("app");

async function isLoggedIn() {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/backend/routes/auth.php?action=check_auth", true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.withCredentials = true; // Important: send cookies

    xhr.onload = function () {
      try {
        const data = JSON.parse(xhr.responseText);
        console.log("Auth check response:", data, "Status:", xhr.status);
        resolve(data.authenticated);
      } catch (error) {
        console.error("Auth check failed:", error);
        resolve(false);
      }
    };

    xhr.onerror = function () {
      console.error("Auth check failed");
      resolve(false);
    };

    xhr.send();
  });
}

page("/frontend", () => {
  loadPage("pages/home.html");
});

page("/frontend/login", () => {
  loadPage("pages/login.html");
});

page("/frontend/signup", () => {
  loadPage("pages/signup.html");
});

page("/frontend/guestbook/:id", async (ctx) => {
  const guestbookId = ctx.params.id;
  loadPage("pages/guestbook-view.html").then(() => {
    loadGuestbookDetails(guestbookId);
  });
});

page("/frontend/about", () => {
  loadPage("pages/about.html");
});

// Profile route - redirect to login if not logged in
page("/frontend/profile", async () => {
  if (await isLoggedIn()) {
    loadPage("pages/profile.html");
  } else {
    page.redirect("/frontend/login"); // Redirect to login page
  }
});

page();

function loadPage(url) {
  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      app.innerHTML = html;

      // Initialize appropriate form based on URL
      if (url.includes("login.html")) {
        console.log("Initializing login form...");
        window.initLogin?.();
      }

      // If the loaded page contains the guestbook container, run showGuestbookEntries.
      if (
        document.getElementById("guestbookentries") &&
        window.showGuestbookEntries
      ) {
        window.showGuestbookEntries();
      }
    })
    .catch((err) => {
      console.error("Page load error:", err);
      app.innerHTML = "<h2>404 - Page Not Found</h2>";
    });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const darkModeStatus = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", darkModeStatus); // Persist dark mode setting
  updateIcon(darkModeStatus);
}

window.onload = function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
    updateIcon(true);
  }
};
