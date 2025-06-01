document.addEventListener("DOMContentLoaded", function () {
  // Form submission handler
  const queryForm = document.querySelector(".query-form");
  if (queryForm) {
    queryForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      if (!name || !email || !message) {
        alert("Please fill out all required fields!");
        return;
      }

      // In a real app, this would send the data to your server
      alert(`Thank you for your message, ${name}! We'll get back to you soon.`);
      queryForm.reset();
    });
  }

  // Animation for feature cards on scroll
  const featureCards = document.querySelectorAll(".feature-card");
  const teamMembers = document.querySelectorAll(".team-member");

  // Simple animation on scroll function
  function animateOnScroll(elements, className) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = 1;
              entry.target.style.transform = "translateY(0)";
            }, 100 * Array.from(elements).indexOf(entry.target));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((element) => {
      element.style.opacity = 0;
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      observer.observe(element);
    });
  }

  // Initialize animations
  animateOnScroll(featureCards);
  animateOnScroll(teamMembers);
});

// Mobile navigation toggle
function toggleMobileNav() {
  const navTabs = document.querySelector(".nav-tabs");
  navTabs.classList.toggle("nav-active");
}
