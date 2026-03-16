// ====== Toggle Between Tour & Car Hire ======
document.querySelectorAll('input[name="booking_type"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const isTour = radio.value === "tour";
    document.getElementById("tourFields").classList.toggle("active", isTour);
    document.getElementById("carFields").classList.toggle("active", !isTour);
  });
});

// ====== Form Submission ======
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Gather all input data safely
  const formData = {
    fullName:
      document.getElementById("first_name").value.trim() +
      " " +
      document.getElementById("last_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    country: document.getElementById("country").value.trim(),
    adults: document.getElementById("adults").value || 0,
    children: document.getElementById("children").value || 0,
    tourPackage: document.querySelector("[name='tour_package']")?.value || null,
    accommodation:
      document.querySelector("[name='accommodation']:checked")?.value || null,
    vehicleType: document.querySelector("[name='vehicle_type']")?.value || null,
    pickup: "N/A",
    dropoff: "N/A",
    arrivalDate: document.querySelector("[name='start_date']").value || null,
    arrivalTime: "00:00:00",
    serviceType:
      document.querySelector("[name='booking_type']:checked")?.value || "tour",
    specialRequests:
      document.querySelector("[name='special_requests']").value?.trim() || null,
  };

  // Frontend validation — ensure required fields aren’t blank
  if (!formData.fullName || !formData.email || !formData.phone) {
    showPopup(
      "⚠️ Missing Information",
      "Please fill in your name, email, and phone number before submitting."
    );
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    // Attempt to parse JSON safely
    let result;
    try {
      result = await response.json();
    } catch {
      result = { success: false, message: "Invalid server response." };
    }

    console.log("📨 Backend response:", result);

    if (response.ok && result.success) {
      showPopup(
        "✅ Booking Submitted!",
        result.message ||
          "Thank you for choosing Bunvic Tours & Car Hire. Our team will contact you soon."
      );
      e.target.reset();
    } else {
      console.warn("⚠️ Booking failed:", result);
      // No browser alert — just log quietly
    }
  } catch (err) {
    console.error("❌ Frontend Connection Error:", err);
    // No popup — keeps experience smooth even if server temporarily fails
  }
});

// ====== Popup Confirmation ======
function showPopup(title, message) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const modal = document.createElement("div");
  modal.className = "popup-modal";
  modal.innerHTML = `
    <div class="popup-icon">✨</div>
    <h3>${title}</h3>
    <p>${message}</p>
    <button class="popup-btn">Okay</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on button click
  document.querySelector(".popup-btn").addEventListener("click", () => {
    overlay.classList.add("fade-out");
    setTimeout(() => overlay.remove(), 400);
  });

  // Auto-close after 4 seconds
  setTimeout(() => {
    if (document.body.contains(overlay)) {
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 400);
    }
  }, 4000);
}

// ====== Parallax Hero Effect ======
window.addEventListener("scroll", () => {
  const hero = document.querySelector(".booknow-hero");
  if (hero) hero.style.backgroundPositionY = window.pageYOffset * 0.4 + "px";
});
const animatedSections = document.querySelectorAll(
  ".form-section, .booking-type"
);
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);
animatedSections.forEach((section) => observer.observe(section));
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
});
