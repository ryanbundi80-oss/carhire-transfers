document.addEventListener("DOMContentLoaded", () => {
  console.log("✨ Bunvic Tours website loaded successfully");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen);
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
  const tabButtons = document.querySelectorAll(".tab-btn");
  const bookingForms = document.querySelectorAll(".booking-form");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      bookingForms.forEach((form) => form.classList.remove("active", "fade-in"));
      const tab = button.getAttribute("data-tab");
      const activeForm = document.getElementById(tab);
      if (activeForm) {
        activeForm.classList.add("active");
        setTimeout(() => activeForm.classList.add("fade-in"), 50);
      }
    });
  });
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll("input[type='date']").forEach((dateInput) => {
    if (!dateInput.value) dateInput.value = today;
  });
  document.querySelectorAll(".booking-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let isValid = true;
      const requiredFields = form.querySelectorAll("input[required], select[required]");

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          field.classList.add("error");
          isValid = false;
        } else {
          field.classList.remove("error");
        }
      });
      if (isValid) {
        alert("Your booking request has been submitted!");
        form.reset();
      } else {
        alert("Please fill in all required fields.");
      }
    });
  });
  document.querySelectorAll("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  const scrollBtn = document.createElement("button");
  scrollBtn.innerText = "⬆";
  scrollBtn.id = "scrollTopBtn";
  Object.assign(scrollBtn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px 15px",
    fontSize: "20px",
    border: "none",
    borderRadius: "50%",
    background: "orange",
    color: "white",
    cursor: "pointer",
    display: "none",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    zIndex: "999",
  });
  document.body.appendChild(scrollBtn);

  window.addEventListener("scroll", () => {
    scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  if (window.AOS) {
    AOS.init({
      once: true,
      duration: 650,
      easing: "ease-out-cubic",
    });
  }
});
