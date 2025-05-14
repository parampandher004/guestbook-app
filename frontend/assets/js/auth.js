document.addEventListener("DOMContentLoaded", () => {
  const verifyForm = document.getElementById("verifyForm");
  if (!verifyForm) return;

  verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("otpError").textContent = "";

    const formData = new FormData(verifyForm);
    console.log("Verify form data:", Object.fromEntries(formData));

    try {
      const response = await fetch("/backend/routes/auth.php?action=verify", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      console.log("Full response object:", response);
      console.log("Response headers:", Object.fromEntries(response.headers));
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      if (!responseText) {
        // Instead of throwing an error, update the UI and exit.
        document.getElementById("otpError").textContent =
          "No response from server. Please try again later.";
        return;
      }
      const data = JSON.parse(responseText);
      console.log("Verification response:", data);

      if (data.success) {
        window.location.href = "/frontend/";
      } else {
        document.getElementById("otpError").textContent = data.message;
      }
    } catch (error) {
      console.error("Verification API Error:", error);
      document.getElementById("otpError").textContent =
        "An error occurred during verification";
    }
  });
});
