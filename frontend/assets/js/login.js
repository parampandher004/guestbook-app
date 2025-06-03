function initLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("loginError").textContent = "";

    const formData = new FormData(loginForm);
    console.log("Login form data:", Object.fromEntries(formData));

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/backend/routes/auth.php?action=login", true);
      xhr.setRequestHeader("Accept", "application/json");

      xhr.onload = function () {
        if (!xhr.responseText) {
          document.getElementById("loginError").textContent =
            "No response from server. Please try again later.";
          return;
        }
        const data = JSON.parse(xhr.responseText);
        console.log("Login response:", data);

        if (data.success) {
          window.location.href = "/frontend/";
        } else {
          document.getElementById("loginError").textContent = data.message;
        }
      };

      xhr.onerror = function () {
        console.error("Login API Error");
        document.getElementById("loginError").textContent =
          "An error occurred during login";
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Login API Error:", error);
      document.getElementById("loginError").textContent =
        "An error occurred during login";
    }
  });
}

window.initLogin = initLogin;
