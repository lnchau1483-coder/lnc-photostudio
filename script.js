/* ================================================================
   LNC_PhotoStudio — Premium Landing Page JavaScript
   Handles: Navigation, Scroll Animations, Before/After Sliders,
   FAQ Accordion, Gallery Lightbox, Counter Animation, Mobile Menu
   ================================================================ */

(function () {
  'use strict';

  // ── Navigation Scroll Effect ──
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── Mobile Menu Toggle ──
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.nav__mobile-link');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('nav--open');
      document.body.style.overflow = nav.classList.contains('nav--open') ? 'hidden' : '';

      const isOpen = nav.classList.contains('nav--open');
      navToggle.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav--open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Scroll Reveal Animation (Intersection Observer) ──
  const fadeElements = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  // ── Before/After Comparison Sliders ──
  function initSlider(slider) {
    const input = slider.querySelector('.ba-slider__input');
    if (!input) return;

    function updateSlider(value) {
      slider.style.setProperty('--pos', `${value}%`);
    }

    // Set initial position
    updateSlider(input.value);

    // Range input
    input.addEventListener('input', (e) => {
      updateSlider(e.target.value);
    });

    // Touch/pointer support for smoother interaction
    let isDragging = false;

    function getPosition(e) {
      const rect = slider.getBoundingClientRect();
      let clientX;

      if (e.touches && e.touches.length) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }

      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      return percent;
    }

    slider.addEventListener('pointerdown', (e) => {
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
      const pos = getPosition(e);
      updateSlider(pos);
      input.value = pos;
    });

    slider.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const pos = getPosition(e);
      updateSlider(pos);
      input.value = pos;
    });

    slider.addEventListener('pointerup', () => {
      isDragging = false;
    });

    slider.addEventListener('pointercancel', () => {
      isDragging = false;
    });
  }

  document.querySelectorAll('.ba-slider').forEach(initSlider);

  // ── FAQ Accordion ──
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-item--open');

      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('faq-item--open');
        otherItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add('faq-item--open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Gallery Lightbox ──
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery__item[data-lightbox]');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-lightbox');
      const alt = item.querySelector('img').getAttribute('alt');
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('lightbox--active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('lightbox--active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = '';
    }, 300);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('lightbox--active')) {
      closeLightbox();
    }
  });

  // ── Counter Animation ──
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    const duration = 1500;
    const start = performance.now();
    const startValue = 0;

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  const counterElements = document.querySelectorAll('.counter[data-target]');

  if ('IntersectionObserver' in window && counterElements.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterElements.forEach(el => counterObserver.observe(el));
  }

  // ── Mobile Sticky CTA Visibility ──
  const mobileCta = document.getElementById('mobileCta');
  const heroSection = document.getElementById('top');

  if (mobileCta && heroSection) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          mobileCta.style.transform = entry.isIntersecting ? 'translateY(100%)' : 'translateY(0)';
          mobileCta.style.transition = 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
      },
      { threshold: 0.1 }
    );

    ctaObserver.observe(heroSection);
  }

  // ── Preload hero image for faster LCP ──
  const heroImg = document.querySelector('.hero__bg img');
  if (heroImg && heroImg.complete) {
    heroImg.style.opacity = '1';
  }

})();
