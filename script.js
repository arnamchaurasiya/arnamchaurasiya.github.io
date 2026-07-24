const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const revealItems = document.querySelectorAll(".reveal");
const sections = Array.from(document.querySelectorAll("main section[id]"));
const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("nav-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      topbar.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (topbar.contains(event.target)) return;
    topbar.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
}

if (!motionReduced && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === activeId;
          if (isActive) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-15% 0px -45% 0px",
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

if (!motionReduced) {
  const tiltTargets = document.querySelectorAll("[data-tilt]");

  tiltTargets.forEach((target) => {
    const baseTilt = Number.parseFloat(target.dataset.tilt || "0");

    target.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 861) return;

      const rect = target.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = offsetY * -2;
      const rotateY = offsetX * 3;

      target.style.transform = `rotate(${baseTilt}deg) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    target.addEventListener("pointerleave", () => {
      target.style.transform = "";
    });
  });
}

// --- Carousel Logic ---
function initCarousels() {
  const carousels = document.querySelectorAll('.wide-card-carousel');
  
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const images = track.querySelectorAll('img');
    const dotsContainer = carousel.querySelector('.carousel-nav');
    
    if (!track || images.length <= 1) {
      // Hide nav if there are no slides to navigate
      if (dotsContainer) dotsContainer.style.display = 'none';
      return;
    }
    
    dotsContainer.innerHTML = '';
    images.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${idx + 1}`);
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
    
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let intervalId;
    
    function updateCarouselHeight() {
      const currentImage = images[currentIndex];
      if (currentImage && currentImage.offsetHeight > 0) {
        carousel.style.height = `${currentImage.offsetHeight}px`;
      }
    }
    
    function goToSlide(index) {
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
      updateCarouselHeight();
      resetInterval();
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % images.length;
      goToSlide(currentIndex);
    }
    
    function resetInterval() {
      clearInterval(intervalId);
      intervalId = setInterval(nextSlide, 3500);
    }
    
    resetInterval();
    
    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', resetInterval);

    images.forEach(img => {
      if (img.complete) {
        updateCarouselHeight();
      } else {
        img.addEventListener('load', updateCarouselHeight);
      }
    });

    window.addEventListener('resize', updateCarouselHeight);
    
    updateCarouselHeight();
  });
}

initCarousels();

// --- Certificate Modal Logic ---
function initCertificateModal() {
  const modal = document.getElementById('certificate-modal');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = modal.querySelector('.lightbox-close');
  const certButtons = document.querySelectorAll('.cert-icon-btn');

  if (!modal || !modalImg) return;

  function openModal(imageSrc) {
    modalImg.src = imageSrc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Optional: clear src after animation finishes to reset
    setTimeout(() => { modalImg.src = ''; }, 300);
  }

  certButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const certSrc = btn.getAttribute('data-cert');
      if (certSrc) {
        openModal(certSrc);
      }
    });
  });

  const achievementImages = document.querySelectorAll('.achievement-img');
  achievementImages.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      if (img.src) {
        openModal(img.src);
      }
    });
  });

  const carouselImages = document.querySelectorAll('.wide-card-carousel img');
  carouselImages.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      if (img.src) {
        openModal(img.src);
      }
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === modal.querySelector('.lightbox-content')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

initCertificateModal();


