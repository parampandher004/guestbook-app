function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const darkModeStatus = document.body.classList.contains("dark-mode");
  console.log("Dark mode status:", darkModeStatus); // Debugging
  localStorage.setItem("darkMode", darkModeStatus); // Persist dark mode setting
  updateIcon(darkModeStatus);
}

function updateIcon(isDarkMode) {
  const icon = document.getElementById("darkModeIcon");
  if (isDarkMode) {
    icon.textContent = "🌙"; // Moon emoji
  } else {
    icon.textContent = "🌞"; // Sun emoji
  }
}

window.onload = function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  console.log("Dark mode on load:", darkMode); // Debugging
  if (darkMode) {
    document.body.classList.add("dark-mode");
    updateIcon(true);
  }
};

function validateSignup() {
  const email = document.querySelector('[name="email"]').value;
  const dob = document.querySelector('[name="dob"]').value;
  const errorDiv = document.getElementById("signupError");

  // Check if email ends with @gmail.com
  if (!email.endsWith("@gmail.com")) {
    errorDiv.textContent = "Only @gmail.com emails are allowed.";
    return false;
  }

  // Check if age is greater than 18 and less than 100
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    errorDiv.textContent = "You must be at least 18 years old to sign up.";
    return false;
  }

  if (age > 100) {
    errorDiv.textContent = "Age must be less than 100 years to sign up.";
    return false;
  }

  return true;
}