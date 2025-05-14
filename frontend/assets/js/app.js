const app = document.getElementById("app");

function isLoggedIn() {
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("userId="));
}

page("/frontend", () => {
  loadPage("pages/home.html");
});

page("/frontend/login", () => {
  loadPage("pages/login.html"); // now using correct relative path
});

page("/frontend/signup", () => {
  loadPage("pages/signup.html"); // updated path without extra ../
});

page("/frontend/guestbook", () => {
  loadPage("pages/guestbook.html"); // updated path without extra ../
});

page("/frontend/about", () => {
  loadPage("pages/about.html");
});

// Profile route - redirect to login if not logged in
page("/frontend/profile", () => {
  if (isLoggedIn()) {
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

function updateIcon(isDarkMode) {
  const icon = document.getElementById("darkModeIcon");
  icon.textContent = isDarkMode ? "🌙" : "☀️"; // Moon for dark mode, Sun for light mode
}

// Add scroll handler for footer
window.addEventListener("scroll", () => {
  const footer = document.querySelector("footer");
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Show footer when near bottom
  if (windowHeight + scrollTop >= documentHeight - 100) {
    footer.style.bottom = "0";
  } else {
    footer.style.bottom = "-300px";
  }
});

window.onload = function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
    updateIcon(true);
  }
};
