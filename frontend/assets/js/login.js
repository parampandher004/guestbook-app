function initLogin() {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/backend/routes/auth.php?action=login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        alert(response.message);
        if (response.success) {
          window.location.href = "profile.html";
        }
      }
    };
    xhr.send(JSON.stringify({ email, password }));
  });
}

window.onload = initLogin;
