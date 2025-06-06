const app = document.getElementById("app");
const BASE_PATH = "/frontend";

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
  await loadPage("pages/guestbook-view.html");
  await loadPageScript("pages/guestbook-view.html");

  const guestbook = JSON.parse(localStorage.getItem("currentGuestbook"));
  document.getElementById("guestbook-title").textContent = guestbook.title;
  document.getElementById(
    "guestbook-description"
  ).textContent = `Description: ${guestbook.description}`;

  // Now fetch messages after script is loaded
  console.log(window.fetchMessages);
  window.fetchMessages?.(guestbookId);
});

page("/frontend/about", () => {
  loadPage("pages/about.html");
});

// Profile route - redirect to login if not logged in
page("/frontend/profile", async () => {
  console.log(isLoggedIn());
  if (await isLoggedIn()) {
    loadPage("pages/profile.html");
  } else {
    page.redirect("/frontend/login");
  }
});

page("/frontend/guestbook", async () => {
  if (await isLoggedIn()) {
    loadPage("pages/guestbook.html");
  } else {
    page.redirect("/frontend/login");
  }
});

page();

// Add page-script mapping
const pageScripts = {
  "pages/home.html": "home.js",
  "pages/guestbook.html": "guestbook.js",
  "pages/login.html": "login.js",
  "pages/signup.html": "signup.js",
  "pages/guestbook-view.html": "guestbook-view.js",
  "pages/profile.html": "profile.js",
};

function loadPageScript(url) {
  const scriptName = pageScripts[url];
  if (!scriptName) return Promise.resolve();

  return new Promise((resolve) => {
    const existingScript = document.querySelector(
      `script[src*="${scriptName}"]`
    );
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = `/frontend/assets/js/${scriptName}`;
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

function loadPage(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((html) => {
      app.innerHTML = html;
      return loadPageScript(url);
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
}

window.onload = function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
  }
};
