const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("is-open", !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
  });
});

const revealTargets = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const sectionTargets = navLinks
  .map((link) => {
    const href = link.getAttribute("href");
    if (!href?.startsWith("#")) return null;
    return { link, section: document.querySelector(href) };
  })
  .filter((item) => item?.section);

if ("IntersectionObserver" in window && sectionTargets.length) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.remove("is-active"));
        const active = sectionTargets.find((item) => item.section === entry.target);
        active?.link.classList.add("is-active");
      });
    },
    { rootMargin: "-34% 0px -58% 0px", threshold: 0.01 }
  );

  sectionTargets.forEach(({ section }) => activeObserver.observe(section));
}

const discoveryAnimation = document.querySelector("[data-discovery-animation]");

if (discoveryAnimation) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const candidates = [...discoveryAnimation.querySelectorAll("[data-candidate]")];
  const paths = [...discoveryAnimation.querySelectorAll("[data-path]")];
  const candidateIds = candidates.map((candidate) => candidate.dataset.candidate);
  let activeIndex = Math.max(0, candidateIds.indexOf("shop"));
  let cycleTimer;

  const setActiveCandidate = (candidateId) => {
    discoveryAnimation.dataset.active = candidateId;

    candidates.forEach((candidate) => {
      const isActive = candidate.dataset.candidate === candidateId;
      candidate.classList.toggle("is-active", isActive);
      candidate.setAttribute("aria-pressed", String(isActive));
    });

    paths.forEach((path) => {
      path.classList.toggle("is-active", path.dataset.path === candidateId);
    });
  };

  const stopCycle = () => {
    if (!cycleTimer) return;
    window.clearInterval(cycleTimer);
    cycleTimer = undefined;
  };

  const startCycle = () => {
    if (reduceMotion || cycleTimer || candidateIds.length < 2) return;
    cycleTimer = window.setInterval(() => {
      activeIndex = (activeIndex + 1) % candidateIds.length;
      setActiveCandidate(candidateIds[activeIndex]);
    }, 2400);
  };

  candidates.forEach((candidate, index) => {
    const activate = () => {
      activeIndex = index;
      stopCycle();
      setActiveCandidate(candidate.dataset.candidate);
    };

    candidate.addEventListener("mouseenter", activate);
    candidate.addEventListener("focus", activate);
    candidate.addEventListener("mouseleave", startCycle);
    candidate.addEventListener("blur", startCycle);
  });

  setActiveCandidate(candidateIds[activeIndex]);
  startCycle();
}
