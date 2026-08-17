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
    
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      images.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Slide ${idx + 1}`);
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });
    }
    
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let intervalId;
    
    function updateCarouselHeight() {
      if (carousel.classList.contains('achievement-img-wrap')) return;
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

// --- Certificate & Image Modal Logic ---
function initCertificateModal() {
  const modal = document.getElementById('certificate-modal');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = modal ? modal.querySelector('.lightbox-close') : null;
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const counterEl = document.getElementById('lightbox-counter');
  const certButtons = document.querySelectorAll('.cert-icon-btn');

  if (!modal || !modalImg) return;

  let currentImages = [];
  let currentIndex = 0;

  function updateModalView() {
    if (currentImages.length === 0) return;
    modalImg.src = currentImages[currentIndex];

    if (currentImages.length > 1) {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
      if (counterEl) {
        counterEl.style.display = 'block';
        counterEl.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      }
    } else {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (counterEl) counterEl.style.display = 'none';
    }
  }

  function openModal(images, startIndex = 0) {
    if (Array.isArray(images)) {
      currentImages = images;
    } else if (typeof images === 'string') {
      currentImages = [images];
    } else {
      currentImages = [];
    }
    currentIndex = startIndex;
    updateModalView();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalImg.src = '';
      currentImages = [];
      currentIndex = 0;
    }, 300);
  }

  function showNextImage() {
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateModalView();
  }

  function showPrevImage() {
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateModalView();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrevImage();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNextImage();
    });
  }

  certButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const certSrc = btn.getAttribute('data-cert');
      if (certSrc) {
        openModal([certSrc], 0);
      }
    });
  });

  function setupImageClickListeners(selector) {
    const images = document.querySelectorAll(selector);
    images.forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const carouselContainer = img.closest('.wide-card-carousel, .achievement-img-wrap, .role-carousel');
        if (carouselContainer) {
          const siblingImgs = Array.from(carouselContainer.querySelectorAll('img')).filter(i => i.src);
          const idx = siblingImgs.indexOf(img);
          const imageSources = siblingImgs.map(i => i.src);
          openModal(imageSources, idx >= 0 ? idx : 0);
        } else if (img.src) {
          openModal([img.src], 0);
        }
      });
    });
  }

  setupImageClickListeners('.achievement-img');
  setupImageClickListeners('.wide-card-carousel img');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === modal.querySelector('.lightbox-content')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    } else if (e.key === 'ArrowLeft') {
      showPrevImage();
    }
  });
}

initCertificateModal();

// --- Hide floating mail button when contact section is in view ---
function initMailFloatObserver() {
  const contactSection = document.getElementById("contact");
  const mailFloat = document.querySelector(".mail-float");

  if (!contactSection || !mailFloat || !("IntersectionObserver" in window)) return;

  const mailFloatObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mailFloat.classList.add("mail-float-hidden");
        } else {
          mailFloat.classList.remove("mail-float-hidden");
        }
      });
    },
    {
      threshold: 0.08,
    }
  );

  mailFloatObserver.observe(contactSection);
}

initMailFloatObserver();
