function validateLogin() {
  const email = document.querySelector('[name="email"]').value;
  const errorDiv = document.getElementById("loginError");

  if (!email.endsWith("@gmail.com")) {
    errorDiv.textContent = "Only @gmail.com emails are allowed.";
    return false;
  }

  return true;
}
