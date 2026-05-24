(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");
  const projectsScroll = document.querySelector(".projects-scroll");

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getPreferredTheme() {
    return "light";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "切換為淺色主題" : "切換為深色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme =
      stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟選單");
  }

  function openNav() {
    if (!header || !navToggle) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "關閉選單");
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle || !header) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      });
    });
  }

  function initReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.08 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initDragScroll() {
    if (!projectsScroll) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    projectsScroll.addEventListener("mousedown", function (e) {
      isDown = true;
      projectsScroll.classList.add("is-dragging");
      startX = e.pageX - projectsScroll.offsetLeft;
      scrollLeft = projectsScroll.scrollLeft;
    });

    projectsScroll.addEventListener("mouseleave", function () {
      isDown = false;
      projectsScroll.classList.remove("is-dragging");
    });

    projectsScroll.addEventListener("mouseup", function () {
      isDown = false;
      projectsScroll.classList.remove("is-dragging");
    });

    projectsScroll.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - projectsScroll.offsetLeft;
      const walk = (x - startX) * 1.5;
      projectsScroll.scrollLeft = scrollLeft - walk;
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initRandomDog() {
    const DOG_API = "https://dog.ceo/api/breeds/image/random";
    const btn = document.getElementById("dog-btn");
    const image = document.getElementById("dog-image");
    const placeholder = document.getElementById("dog-placeholder");
    const loading = document.getElementById("dog-loading");
    const errorEl = document.getElementById("dog-error");

    if (!btn || !image || !placeholder || !loading || !errorEl) return;

    function showPlaceholder() {
      placeholder.hidden = false;
      loading.hidden = true;
      image.hidden = true;
      image.removeAttribute("src");
    }

    function showLoading() {
      placeholder.hidden = true;
      loading.hidden = false;
      image.hidden = true;
      errorEl.hidden = true;
      errorEl.textContent = "";
      btn.disabled = true;
    }

    function showImage(src) {
      placeholder.hidden = true;
      loading.hidden = true;
      image.hidden = false;
      image.src = src;
      btn.disabled = false;
    }

    function showError(message) {
      loading.hidden = true;
      btn.disabled = false;
      errorEl.hidden = false;
      errorEl.textContent = message;
      if (!image.src) {
        placeholder.hidden = false;
      }
    }

    image.addEventListener("load", function () {
      loading.hidden = true;
      image.hidden = false;
      btn.disabled = false;
    });

    image.addEventListener("error", function () {
      showError("圖片載入失敗，請再試一次。");
    });

    btn.addEventListener("click", function () {
      showLoading();

      fetch(DOG_API)
        .then(function (res) {
          if (!res.ok) {
            throw new Error("API 請求失敗");
          }
          return res.json();
        })
        .then(function (data) {
          if (data.status !== "success" || !data.message) {
            throw new Error("無法取得狗狗圖片");
          }
          image.alt = "隨機狗狗照片";
          image.src = data.message;
        })
        .catch(function () {
          showError("無法連線到 API，請稍後再試。");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    initNavToggle();
    initSmoothScroll();
    initReveal();
    initDragScroll();
    initYear();
    initRandomDog();
  });
})();
