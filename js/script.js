const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const hero = document.querySelector(".hero");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const submitButton = contactForm.querySelector('button[type="submit"]');
const submitButtonLabel = submitButton.innerHTML;
const themeToggle = document.querySelector(".theme-toggle");
const studioIntro = document.querySelector("#studio-intro");
const introSkip = studioIntro.querySelector(".intro-skip");
const savedTheme = localStorage.getItem("portfolio-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let pointerX = 0;
  let pointerY = 0;
  let pointerFrame = 0;

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      document.body.style.setProperty("--cursor-x", `${pointerX}px`);
      document.body.style.setProperty("--cursor-y", `${pointerY}px`);
      hero.style.setProperty("--portrait-x", `${((pointerX / window.innerWidth) - 0.5) * 14}px`);
      hero.style.setProperty("--portrait-y", `${((pointerY / window.innerHeight) - 0.5) * 10}px`);
      pointerFrame = 0;
    });
  });

  document.addEventListener("pointerleave", () => {
    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    document.body.style.removeProperty("--cursor-x");
    document.body.style.removeProperty("--cursor-y");
    hero.style.removeProperty("--portrait-x");
    hero.style.removeProperty("--portrait-y");
  });

  document.querySelectorAll(".skill-card, .project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--tilt-x", `${pointerY * -6}deg`);
      card.style.setProperty("--tilt-y", `${pointerX * 6}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}

function applyTheme(theme, savePreference = false) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeToggle.querySelector(".theme-toggle-label").textContent = `${isDark ? "Light" : "Dark"} mode`;

  if (savePreference) localStorage.setItem("portfolio-theme", theme);
}

applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

let introDismissTimer;
function dismissStudioIntro() {
  if (!studioIntro.open || studioIntro.classList.contains("is-leaving")) return;
  window.clearTimeout(introDismissTimer);
  studioIntro.classList.add("is-leaving");
  window.setTimeout(() => studioIntro.close(), 450);
}

introSkip.addEventListener("click", dismissStudioIntro);
studioIntro.addEventListener("cancel", (event) => {
  event.preventDefault();
  dismissStudioIntro();
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  studioIntro.showModal();
  introDismissTimer = window.setTimeout(dismissStudioIntro, 2800);
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    applyTheme(nextTheme, true);
    return;
  }

  if (document.startViewTransition) {
    document.startViewTransition(() => applyTheme(nextTheme, true));
    return;
  }

  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  applyTheme(nextTheme, true);
  window.setTimeout(() => root.classList.remove("theme-transitioning"), 350);
});

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navLinks.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  navLinks.classList.toggle("is-open", !isOpen);
});

navItems.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

let scrollEffectsFrame = 0;
const updateScrollEffects = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
  if (scrollEffectsFrame) return;

  scrollEffectsFrame = window.requestAnimationFrame(() => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hero.style.setProperty("--hero-scroll", `${window.scrollY * 0.08}px`);
    }
    scrollEffectsFrame = 0;
  });
};
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
updateScrollEffects();

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navItems.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

document.querySelector("#current-year").textContent = new Date().getFullYear();

const validationRules = {
  name: (value) => value.trim().length >= 2 ? "" : "Please enter at least 2 characters for your name.",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address.",
  message: (value) => value.trim().length >= 10 ? "" : "Please enter a message of at least 10 characters."
};

function validateField(field) {
  const errorElement = document.querySelector(`#${field.name}-error`);
  const errorMessage = validationRules[field.name](field.value);
  field.setAttribute("aria-invalid", String(Boolean(errorMessage)));
  errorElement.textContent = errorMessage;
  return !errorMessage;
}

Object.keys(validationRules).forEach((fieldName) => {
  const field = contactForm.elements[fieldName];
  field.addEventListener("input", () => {
    if (field.hasAttribute("aria-invalid")) validateField(field);
    formStatus.textContent = "";
  });
  field.addEventListener("blur", () => validateField(field));
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fields = Object.keys(validationRules).map((fieldName) => contactForm.elements[fieldName]);
  const isValid = fields.map(validateField).every(Boolean);

  if (!isValid) {
    fields.find((field) => field.getAttribute("aria-invalid") === "true").focus();
    formStatus.textContent = "";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formStatus.textContent = "";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      formStatus.textContent = "Your message couldn’t be sent. Please try again or email me directly.";
      return;
    }

    contactForm.reset();
    fields.forEach((field) => {
      field.removeAttribute("aria-invalid");
      document.querySelector(`#${field.name}-error`).textContent = "";
    });
    formStatus.textContent = "Thanks for reaching out! Your message has been sent.";
  } catch (error) {
    console.error("Unable to send contact form message.", error);
    formStatus.textContent = "Unable to send your message right now. Please try again or email me directly.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = submitButtonLabel;
  }
});
