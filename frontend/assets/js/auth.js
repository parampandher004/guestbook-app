document.addEventListener("DOMContentLoaded", () => {
  const verifyForm = document.getElementById("verifyForm");
  if (!verifyForm) return;

  verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("otpError").textContent = "";

    const formData = new FormData(verifyForm);
    console.log("Verify form data:", Object.fromEntries(formData));

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/backend/routes/auth.php?action=verify", true);
      xhr.setRequestHeader("Accept", "application/json");

      xhr.onload = function () {
        console.log("Response status:", xhr.status);
        if (!xhr.responseText) {
          document.getElementById("otpError").textContent =
            "No response from server. Please try again later.";
          return;
        }
        const data = JSON.parse(xhr.responseText);
        console.log("Verification response:", data);

        if (data.success) {
          window.location.href = "/frontend/";
        } else {
          document.getElementById("otpError").textContent = data.message;
        }
      };

      xhr.onerror = function () {
        console.error("Verification API Error");
        document.getElementById("otpError").textContent =
          "An error occurred during verification";
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Verification API Error:", error);
      document.getElementById("otpError").textContent =
        "An error occurred during verification";
    }
  });
});
