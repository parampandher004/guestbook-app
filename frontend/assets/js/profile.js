function validateProfile() {
  const username = document.querySelector('[name="username"]').value;
  const email = document.querySelector('[name="email"]').value;
  const errorDiv = document.getElementById("profileError");

  // Validate username (only letters, spaces, and underscores)
  const usernameRegex = /^[a-zA-Z _]+$/;
  if (!usernameRegex.test(username)) {
    errorDiv.textContent = "Username can only contain letters, spaces, and underscores.";
    return false;
  }

  // Validate email
  if (!email.endsWith("@gmail.com")) {
    errorDiv.textContent = "Only @gmail.com emails are allowed.";
    return false;
  }

  return true;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const darkModeStatus = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", darkModeStatus); // Save dark mode preference
  updateDarkModeIcon(darkModeStatus);
}

function updateDarkModeIcon(isDarkMode) {
  const icon = document.getElementById("darkModeIcon");
  icon.textContent = isDarkMode ? "🌙" : "🌞"; // Moon for dark mode, Sun for light mode
}

// Apply dark mode on page load if previously enabled
window.onload = function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
    updateDarkModeIcon(true);
  }
};