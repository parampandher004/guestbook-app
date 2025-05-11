const app = document.getElementById("app");

// Simulate a logged-in state (replace this with your actual authentication logic)
const loggedIn = localStorage.getItem("loggedIn") === "true";

page("/frontend", () => {
  app.innerHTML = "<h2>Home</h2><p>Welcome to the homepage.</p>";
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
  app.innerHTML = "<h2>About</h2><p>Learn more about us.</p>";
});

page("/frontend/contact", () => {
  app.innerHTML = "<h2>Contact</h2><p>Reach out via email or phone.</p>";
});

// Profile route - redirect to login if not logged in
page("/frontend/profile", () => {
  if (loggedIn) {
    loadPage("pages/profile.html");
  } else {
    page.redirect("/frontend/login"); // Redirect to login page
  }
});

page();

function loadPage(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then((html) => {
      document.getElementById("app").innerHTML = html;
    })
    .catch((err) => {
      document.getElementById("app").innerHTML =
        "<h2>404 - Page Not Found</h2>";
      console.error(err);
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

window.onload = function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
    updateIcon(true);
  }
};
