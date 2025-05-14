function initLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("loginError").textContent = "";

    const formData = new FormData(loginForm);
    console.log("Login form data:", Object.fromEntries(formData));

    try {
      const response = await fetch("/backend/routes/auth.php?action=login", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const responseText = await response.text();
      if (!responseText) {
        document.getElementById("loginError").textContent =
          "No response from server. Please try again later.";
        return;
      }

      const data = JSON.parse(responseText);
      console.log("Login response:", data);

      if (data.success) {
        // Set cookie to expire in 7 days
        document.cookie = `userId=${data.userId}; max-age=${
          60 * 60 * 24 * 7
        }; path=/`;
        window.location.href = "/frontend/";
      } else {
        document.getElementById("loginError").textContent = data.message;
      }
    } catch (error) {
      console.error("Login API Error:", error);
      document.getElementById("loginError").textContent =
        "An error occurred during login";
    }
  });
}

window.initLogin = initLogin;
