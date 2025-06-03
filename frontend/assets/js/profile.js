function validateProfile() {
  const username = document.querySelector('[name="username"]').value;
  const email = document.querySelector('[name="email"]').value;
  const errorDiv = document.getElementById("profileError");

  // Validate username (only letters, spaces, and underscores)
  const usernameRegex = /^[a-zA-Z _0-9]+$/;
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

async function fetchUserProfile() {
  try {
    const response = await fetch("/backend/routes/user.php", {
      credentials: "include",
    });
    const data = await response.json();

    if (data.success) {
      displayUserData(data.user);
    } else {
      document.getElementById("profileError").textContent =
        "Failed to load profile";
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

function displayUserData(user) {
  if (!user) {
    console.error("No user data provided");
    return;
  }

  const form = document.getElementById("profileForm");
  if (!form) {
    console.error("Profile form not found");
    return;
  }

  const fields = ["username", "email", "dob", "url"];
  fields.forEach((field) => {
    const element = form.querySelector(`[name="${field}"]`);
    if (!element) {
      console.warn(`Field ${field} not found in form`);
      return;
    }

    element.value = user[field] || "";
    element.disabled = true;

    // Check if button already exists before adding
    const existingButton = element.nextElementSibling;
    if (existingButton && existingButton.tagName === "BUTTON") {
      existingButton.remove();
    }

    const button = document.createElement("button");
    button.textContent = "Edit";
    button.onclick = () => toggleEdit(field);
    element.parentNode.insertBefore(button, element.nextSibling);
  });
}

function toggleEdit(field) {
  const element = document.querySelector(`[name="${field}"]`);
  if (element) {
    element.disabled = !element.disabled;
    const button = element.nextSibling;
    if (element.disabled) {
      button.textContent = "Edit";
      updateField(field, element.value);
    } else {
      button.textContent = "Save";
    }
  }
}

async function updateField(field, value) {
  if (!validateProfile()) return;

  try {
    const response = await fetch("/backend/routes/user.php?action=update", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [field]: value }),
    });

    const data = await response.json();
    if (!data.success) {
      document.getElementById("profileError").textContent = data.message;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

// Initialize only when DOM is ready
fetchUserProfile();
