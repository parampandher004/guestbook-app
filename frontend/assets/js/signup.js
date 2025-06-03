function initSignup() {
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const dob = form.dob.value;
    const image = form.image.value;

    if (!email.endsWith("@gmail.com")) {
      alert("Email must be a Gmail address.");
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/backend/routes/auth.php?action=signup", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        alert(response.message);
        if (response.success) {
          window.location.href = "login.html";
        }
      }
    };
    xhr.send(JSON.stringify({ username, email, password, dob, image }));
  });
}

window.onload = initSignup;
