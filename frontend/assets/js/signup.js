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

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
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

async function onSignupClick(event) {
  event.preventDefault();
  console.log("Sign Up button clicked");

  if (!validateSignup()) {
    return;
  }

  const form = document.getElementById("signupForm");
  const formData = new FormData(form);
  console.log("Form data:", Object.fromEntries(formData));

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/backend/routes/auth.php?action=signup", true);
    xhr.setRequestHeader("Accept", "application/json");

    xhr.onload = function () {
      if (!xhr.responseText) {
        document.getElementById("signupError").textContent =
          "No response from server. Please try again later.";
        return;
      }
      const data = JSON.parse(xhr.responseText);
      console.log("Signup response:", data);

      if (data.success) {
        window.location.href = "/frontend/pages/verify.html";
      } else {
        document.getElementById("signupError").textContent = data.message;
      }
    };

    xhr.onerror = function () {
      console.error("Signup API Error");
      document.getElementById("signupError").textContent =
        "An error occurred during signup";
    };

    xhr.send(formData);
  } catch (error) {
    console.error("API Error:", error);
    document.getElementById("signupError").textContent =
      "An error occurred during signup";
  }
}

// Expose the function globally for inline event handlers
window.onSignupClick = onSignupClick;
