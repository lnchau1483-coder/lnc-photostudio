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

  // ── CMS Hydration (Load data.json) ──
  async function loadCMSData() {
    try {
      const res = await fetch('data.json');
      if (!res.ok) return;
      const data = await res.json();
      
      // Hero
      if (data.hero) {
        const title = document.querySelector('.text-hero');
        const desc = document.querySelector('.hero__desc');
        const bg = document.querySelector('.hero__bg img');
        if (title) title.innerHTML = data.hero.title;
        if (desc) desc.innerHTML = data.hero.desc;
        if (bg) bg.src = data.hero.bgImage;
      }

      // Services
      if (data.services) {
        const srvCards = document.querySelectorAll('#services .service-card');
        data.services.forEach((srv, i) => {
          if (srvCards[i]) {
            const t = srvCards[i].querySelector('.text-card-title');
            const d = srvCards[i].querySelector('.text-body');
            if (t) t.innerHTML = srv.title;
            if (d) d.innerHTML = srv.desc;
          }
        });
      }

      // Gallery
      if (data.gallery) {
        const galItems = document.querySelectorAll('.gallery__item');
        data.gallery.forEach((g, i) => {
          if (galItems[i]) {
            galItems[i].setAttribute('data-lightbox', g.img);
            const img = galItems[i].querySelector('img');
            const cap = galItems[i].querySelector('.gallery__caption');
            if (img) img.src = g.img;
            if (cap) cap.textContent = g.caption;
          }
        });
      }

      // Pricing
      if (data.pricing) {
        const pCards = document.querySelectorAll('#pricing .service-card');
        data.pricing.forEach((p, i) => {
          if (pCards[i]) {
            const title = pCards[i].querySelector('.text-card-title');
            const price = pCards[i].querySelector('.pricing-card__price');
            const period = pCards[i].querySelector('.pricing-card__period');
            if (title) title.innerHTML = p.title;
            if (price) price.innerHTML = p.price;
            if (period) period.innerHTML = p.period;
            
            // Features
            const features = pCards[i].querySelectorAll('.pricing-card__feature');
            p.features.forEach((feat, j) => {
              if (features[j]) {
                features[j].innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${feat}`;
              }
            });
          }
        });
      }

      // FAQ
      if (data.faq) {
        const faqs = document.querySelectorAll('.faq-item');
        data.faq.forEach((f, i) => {
          if (faqs[i]) {
            const q = faqs[i].querySelector('.faq-item__question span:first-child');
            const a = faqs[i].querySelector('.faq-item__answer p');
            if (q) q.textContent = f.q;
            if (a) a.textContent = f.a;
          }
        });
      }

    } catch (err) {
      console.log('CMS data not found or failed to load:', err);
    }
  }

  loadCMSData();

  // ── Booking Form Submission (Google Apps Script) ──
  const bookingForm = document.getElementById('bookingForm');
  const formMessage = document.getElementById('formMessage');
  const submitBookingBtn = document.getElementById('submitBookingBtn');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(bookingForm);
      const data = Object.fromEntries(formData.entries());
      
      submitBookingBtn.disabled = true;
      submitBookingBtn.textContent = 'Đang gửi...';
      formMessage.style.display = 'block';
      formMessage.style.color = 'var(--text-secondary)';
      formMessage.textContent = 'Đang kết nối tới máy chủ...';

      try {
        // Thay "YOUR_WEB_APP_URL" bằng URL của Google Apps Script bạn vừa deploy
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzww8LC8yIfM9oh8ZJUqp-LAKjkEdxg_Ze7lxHUUaSOxAh-ySgBGgD-HqxFalhblbhv/exec';
        
        if (GOOGLE_SCRIPT_URL === 'YOUR_WEB_APP_URL') {
          throw new Error('Vui lòng thay thế YOUR_WEB_APP_URL trong script.js bằng URL Google Apps Script của bạn.');
        }

        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Cần thiết để bỏ qua lỗi CORS của Google Script
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        // Vì mode: 'no-cors', response luôn mờ (opaque), ta cứ coi như gửi thành công nếu không văng lỗi
        formMessage.style.color = 'var(--success)';
        formMessage.textContent = '🎉 Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.';
        bookingForm.reset();

      } catch (error) {
        formMessage.style.color = 'var(--danger)';
        formMessage.textContent = error.message.includes('YOUR_WEB_APP_URL') 
            ? error.message 
            : '❌ Có lỗi xảy ra khi gửi. Vui lòng thử lại sau hoặc gọi hotline.';
        console.error(error);
      } finally {
        submitBookingBtn.disabled = false;
        submitBookingBtn.textContent = 'Gửi thông tin đặt lịch';
      }
    });
  }

})();
