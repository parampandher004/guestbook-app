function validateProfile() {
  const username = document.querySelector('[name="username"]').value;
  const email = document.querySelector('[name="email"]').value;
  const errorDiv = document.getElementById("profileError");

  // Validate username (only letters, spaces, and underscores)
  const usernameRegex = /^[a-zA-Z _]+$/;
  if (!usernameRegex.test(username)) {
    errorDiv.textContent =
      "Username can only contain letters, spaces, and underscores.";
    return false;
  }

  // Validate email
  if (!email.endsWith("@gmail.com")) {
    errorDiv.textContent = "Only @gmail.com emails are allowed.";
    return false;
  }

  return true;
}
