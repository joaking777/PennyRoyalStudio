'use strict';
 
/* ─────────────────────────────────────
   1. NAVBAR
   · Agrega clase .scrolled al hacer scroll
   · Toggle menú mobile
───────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
 
  // Scroll → cambiar apariencia de la navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
 
  // Botón hamburguesa (mobile)
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
 
    // Animar las 3 líneas del botón
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });
 
  // Cerrar menú al hacer click en un link (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });
})();
 
 
/* ─────────────────────────────────────
   2. WAVEFORM ANIMADO (mockup DAW)
   · Genera barras de altura aleatoria
   · Las anima como si fuera audio en vivo
   · Cada pista tiene su propio color (variable CSS --c)
───────────────────────────────────── */
(function initWaveforms() {
  const BAR_COUNT = 40; // cantidad de barras por pista
  const waveforms = document.querySelectorAll('.waveform');
 
  // Construir las barras para cada waveform
  waveforms.forEach(wf => {
    const track = wf.closest('.daw-track');
    const color = track ? getComputedStyle(track).getPropertyValue('--c').trim() : '#4A5240';
 
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement('div');
      bar.classList.add('waveform-bar');
      bar.style.setProperty('--c', color);
      bar.style.background = color;
      bar.style.height = randomHeight() + 'px';
      wf.appendChild(bar);
    }
  });
 
  // Función helper: altura aleatoria con distribución natural (más bajos en extremos)
  function randomHeight() {
    const base = Math.random();
    // Curva gaussiana aproximada para que el centro sea más alto
    return Math.max(2, Math.round(base * base * 22 + 2));
  }
 
  // Animación continua de las barras cuando el "play" está activo
  let playing     = false;
  let animFrameId = null;
 
  function animateBars() {
    if (!playing) return;
 
    waveforms.forEach(wf => {
      const bars = wf.querySelectorAll('.waveform-bar');
      bars.forEach(bar => {
        // Solo actualiza ~30% de las barras por frame para dar efecto natural
        if (Math.random() > 0.7) {
          bar.style.height = randomHeight() + 'px';
        }
      });
    });
 
    animFrameId = requestAnimationFrame(animateBars);
  }
 
  // Exponer para el botón play
  window._dawPlay = function () {
    playing = true;
    animateBars();
  };
 
  window._dawPause = function () {
    playing = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
  };
})();
 
 
/* ─────────────────────────────────────
   3. BOTÓN PLAY del mockup DAW
   · Alterna entre play y pause
   · Activa/desactiva la animación del waveform
───────────────────────────────────── */
(function initPlayButton() {
  const playBtn = document.getElementById('playBtn');
  if (!playBtn) return;
 
  let isPlaying = false;
 
  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    const icon = playBtn.querySelector('i');
 
    if (isPlaying) {
      icon.className = 'fas fa-pause';
      playBtn.setAttribute('aria-label', 'Pausar');
      playBtn.setAttribute('aria-pressed', 'true');
      window._dawPlay && window._dawPlay();
    } else {
      icon.className = 'fas fa-play';
      playBtn.setAttribute('aria-label', 'Reproducir');
      playBtn.setAttribute('aria-pressed', 'false');
      window._dawPause && window._dawPause();
    }
  });
})();
 
 
/* ─────────────────────────────────────
   4. ANIMACIONES DE ENTRADA (fade-in)
   · Usa IntersectionObserver para revelar
     elementos cuando entran al viewport
   · Los elementos necesitan clase .fade-in
     en el HTML (se agrega automáticamente
     a las tarjetas de features, pasos, etc.)
───────────────────────────────────── */
(function initFadeIn() {
  // Elementos que van a tener animación de entrada
  const targets = [
    '.feature-card',
    '.step-card',
    '.download-card',
    '.faq-item',
    '.screenshot-card',
    '.stat',
    '.section-header',
    '.github-banner',
    '.tutorial-chapters',
    '.video-wrapper',
    '.chapter-item',
    '.roadmap-item',
  ];
 
  // Agregar clase fade-in a todos los elementos objetivo
  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('fade-in');
      // Delay escalonado para grillas (máx 0.5s)
      el.style.transitionDelay = Math.min(i * 0.08, 0.5) + 's';
    });
  });
 
  // Observer que activa la animación
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Una vez visible, dejar de observar
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,     // 10% del elemento visible para disparar
      rootMargin: '0px 0px -40px 0px', // Un poco antes del borde inferior
    }
  );
 
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();
 
 
/* ─────────────────────────────────────
   5. FAQ — ACORDEÓN
   · Click en pregunta abre/cierra respuesta
   · Solo una respuesta abierta a la vez
   · Sincroniza aria-expanded para lectores de pantalla
───────────────────────────────────── */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
 
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
 
    question.addEventListener('click', () => {
      const isOpen = question.classList.contains('open');
 
      // Cerrar todos los demás
      faqItems.forEach(other => {
        const q = other.querySelector('.faq-question');
        q.classList.remove('open');
        q.setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer').classList.remove('open');
      });
 
      // Si no estaba abierto, abrirlo
      if (!isOpen) {
        question.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
 
        // Scroll suave para que la respuesta quede visible
        setTimeout(() => {
          answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  });
})();
 
 
/* ─────────────────────────────────────
   6. CAPÍTULOS DEL TUTORIAL
   · Click o Enter/Espacio en capítulo → lo marca como activo
   · (Cuando tengas el video real podés
      conectar esto al iframe de YouTube
      usando la YouTube IFrame API para
      saltar al tiempo exacto)
───────────────────────────────────── */
(function initChapters() {
  const chapters = document.querySelectorAll('.chapter-item');
 
  function selectChapter(chapter) {
    // Quitar activo de todos
    chapters.forEach(c => c.classList.remove('active'));
    // Marcar este como activo
    chapter.classList.add('active');
 
    // Feedback visual: resaltar el tiempo
    const time = chapter.querySelector('.chapter-time');
    if (time) {
      time.style.transform = 'scale(1.15)';
      setTimeout(() => { time.style.transform = ''; }, 300);
    }
 
    // ── Conectar con YouTube IFrame API (cuando tengas el video real) ──
    // Descomentá este bloque y reemplazá con tu player de YouTube:
    //
    // const timeStr = chapter.dataset.time; // ej: "5:40"
    // const [min, sec] = timeStr.split(':').map(Number);
    // const seconds = min * 60 + sec;
    // if (window.youtubePlayer) {
    //   window.youtubePlayer.seekTo(seconds, true);
    // }
  }
 
  chapters.forEach(chapter => {
    chapter.addEventListener('click', () => selectChapter(chapter));
 
    // Soporte de teclado: Enter o Espacio activan el capítulo
    chapter.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectChapter(chapter);
      }
    });
  });
 
  // Agregar estilos para el estado activo
  const style = document.createElement('style');
  style.textContent = `
    .chapter-item.active {
      background: rgba(139, 26, 26, 0.08) !important;
      border-left: 2px solid #8B1A1A;
    }
    .chapter-item.active .chapter-time {
      color: #B02020;
      transition: transform 0.3s ease;
    }
    .chapter-item.active .chapter-info strong {
      color: #F0EBE0;
    }
  `;
  document.head.appendChild(style);
})();
 
 
/* ─────────────────────────────────────
   7. SMOOTH SCROLL para links internos
   · Compensa el alto de la navbar fija
───────────────────────────────────── */
(function initSmoothScroll() {
  const NAVBAR_HEIGHT = 70; // px — ajustar si cambia el alto de la navbar
 
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
 
      const target = document.querySelector(targetId);
      if (!target) return;
 
      e.preventDefault();
 
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
 
 
/* ─────────────────────────────────────
   8. TICKER (banda roja) — duplicar texto
   para scroll infinito fluido
───────────────────────────────────── */
(function initTicker() {
  const stripInner = document.querySelector('.strip-inner');
  if (!stripInner) return;
 
  const original = stripInner.querySelector('p');
  if (!original) return;
 
  // Duplicar para que el scroll sea continuo
  const clone = original.cloneNode(true);
  stripInner.appendChild(clone);
})();
 
 
/* ─────────────────────────────────────
   9. ACTIVE NAV LINK según scroll
   · Resalta el link de navegación según
     qué sección está en pantalla
───────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
 
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + id) {
              link.style.color = 'var(--crema-claro)';
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );
 
  sections.forEach(section => observer.observe(section));
})();
 
 
/* ─────────────────────────────────────
   10. RESPETAR "prefers-reduced-motion"
   · Helper global para saltear animaciones
     pesadas si el usuario lo pidió en su SO
───────────────────────────────────── */
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ─────────────────────────────────────
   11. PARTÍCULAS FLOTANTES DEL HERO
   · Canvas liviano con partículas tipo
     "polvo dorado" flotando hacia arriba
───────────────────────────────────── */
(function initHeroParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas || PREFERS_REDUCED_MOTION) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  let particles = [];
  let rafId = null;

  const COLORS = ['#DE9F76', '#B37E6C', '#CDAC80'];
  const PARTICLE_COUNT = window.innerWidth < 768 ? 18 : 40;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      r: Math.random() * 1.8 + 0.6,
      speed: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;

      // Reciclar partícula cuando sale por arriba
      if (p.y < -10) Object.assign(p, createParticle(), { y: canvas.height + 10 });

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
  }, { passive: true });

  // Pausar cuando el hero no está visible (ahorro de batería/CPU)
  const visObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!rafId) draw();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0 });
  visObserver.observe(hero);
})();


/* ─────────────────────────────────────
   12. ECUALIZADOR DE FONDO DEL HERO
   · Genera barras y las anima con
     alturas pseudo-aleatorias en loop
───────────────────────────────────── */
(function initHeroEq() {
  const eq = document.getElementById('heroEq');
  if (!eq) return;

  const BAR_COUNT = window.innerWidth < 768 ? 30 : 60;
  const bars = [];

  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement('div');
    bar.classList.add('eq-bar');
    bar.style.height = '4px';
    eq.appendChild(bar);
    bars.push(bar);
  }

  if (PREFERS_REDUCED_MOTION) {
    bars.forEach(b => { b.style.height = (10 + Math.random() * 40) + 'px'; });
    return;
  }

  function tick() {
    bars.forEach(bar => {
      if (Math.random() > 0.6) {
        bar.style.height = Math.round(6 + Math.random() * Math.random() * 130) + 'px';
        bar.style.transition = 'height 0.4s ease';
      }
    });
    setTimeout(tick, 260);
  }
  tick();
})();


/* ─────────────────────────────────────
   13. PARALLAX AL MOVER EL MOUSE
   · Las luces de fondo y el mockup del
     DAW reaccionan sutilmente al mouse
───────────────────────────────────── */
(function initMouseParallax() {
  const hero    = document.getElementById('hero');
  const glow1   = document.querySelector('.hero-glow-1');
  const glow2   = document.querySelector('.hero-glow-2');
  const mockup  = document.getElementById('dawMockup');
  if (!hero || PREFERS_REDUCED_MOTION) return;

  let ticking = false;

  hero.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 → 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      if (glow1) glow1.style.transform = `translate(${relX * -40}px, ${relY * -30}px)`;
      if (glow2) glow2.style.transform = `translate(${relX * 30}px, ${relY * 40}px)`;

      // Tilt 3D del mockup del DAW (efecto "flota y sigue al mouse")
      if (mockup) {
        const rotateY = relX * 10;   // grados
        const rotateX = relY * -10;
        mockup.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      }

      ticking = false;
    });
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    if (glow1) glow1.style.transform = '';
    if (glow2) glow2.style.transform = '';
    if (mockup) mockup.style.transform = '';
  });
})();


/* ─────────────────────────────────────
   14. TABS DEL MOCKUP DEL DAW
   · Alterna entre las vistas Timeline,
     Mixer y Piano Roll
───────────────────────────────────── */
(function initDawTabs() {
  const tabs  = document.querySelectorAll('.daw-tab');
  const panels = document.querySelectorAll('.daw-view');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.viewPanel === view);
      });
    });
  });
})();


/* ─────────────────────────────────────
   15. PIANO ROLL DECORATIVO
   · Genera notas MIDI de ejemplo en
     distintas filas para simular una
     composición real
───────────────────────────────────── */
(function initPianoRoll() {
  const roll = document.getElementById('pianoRoll');
  if (!roll) return;

  const ROWS = 12;       // "teclas" visibles
  const ROW_HEIGHT = 15; // debe coincidir con el gradient del CSS
  const NOTE_COUNT = 26;

  for (let i = 0; i < NOTE_COUNT; i++) {
    const note = document.createElement('div');
    note.classList.add('pianoroll-note');

    const row = Math.floor(Math.random() * ROWS);
    const left = Math.random() * 88; // %
    const width = 3 + Math.random() * 8; // %

    note.style.top   = (row * ROW_HEIGHT + 2) + 'px';
    note.style.left  = left + '%';
    note.style.width = width + '%';

    roll.appendChild(note);
  }
})();


/* ─────────────────────────────────────
   16. MEDIDORES VU (por pista + master)
   · Se activan junto con el play del
     mockup del DAW (ver sección 2 y 3)
───────────────────────────────────── */
(function initVUMeters() {
  const trackVUs  = document.querySelectorAll('.vu-bar');
  const masterVUs = document.querySelectorAll('.master-vu-bar');
  const timeEl    = document.getElementById('transportTime');
  if (!trackVUs.length && !masterVUs.length) return;

  let playing = false;
  let rafId = null;
  let seconds = 154; // arranca en 00:02:34, solo estético

  function randomLevel(max = 100) {
    return Math.max(6, Math.round(Math.random() * Math.random() * max));
  }

  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  }

  let lastTick = 0;
  function loop(ts) {
    if (!playing) return;

    trackVUs.forEach(bar => { bar.style.height = randomLevel(100) + '%'; });
    masterVUs.forEach(bar => {
      bar.style.setProperty('--level', randomLevel(90) + '%');
    });

    if (!lastTick || ts - lastTick > 1000) {
      lastTick = ts;
      seconds += 1;
      if (timeEl) timeEl.textContent = formatTime(seconds);
    }

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    playing = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    trackVUs.forEach(bar => { bar.style.height = '8%'; });
    masterVUs.forEach(bar => { bar.style.setProperty('--level', '12%'); });
  }

  // Engancha con las funciones existentes del waveform (sección 2/3)
  const originalPlay  = window._dawPlay;
  const originalPause = window._dawPause;

  window._dawPlay = function () {
    originalPlay && originalPlay();
    start();
  };

  window._dawPause = function () {
    originalPause && originalPause();
    stop();
  };
})();


/* ─────────────────────────────────────
   17. TILT 3D EN TARJETAS
   · Inclinación sutil siguiendo al mouse
     en feature-cards, step-cards y
     screenshot-cards para dar profundidad
───────────────────────────────────── */
(function initCardTilt() {
  if (PREFERS_REDUCED_MOTION) return;

  const selector = '.feature-card, .step-card';
  const cards = document.querySelectorAll(selector);
  const MAX_TILT = 6; // grados

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `perspective(600px) rotateY(${relX * MAX_TILT * 2}deg) rotateX(${relY * -MAX_TILT * 2}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────
   18. CARRUSEL DE CAPTURAS + LIGHTBOX
   · Slider con flechas, dots y navegación
     por teclado (← → cuando el carrusel
     tiene foco, Enter/Espacio abre la
     captura enfocada)
   · Lightbox con zoom, navegación y
     descripciones
───────────────────────────────────── */
(function initScreenshotsCarousel() {
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');
  const viewport = document.getElementById('carouselViewport');
  if (!track) return;

  const cards = Array.from(track.children);
  let perView = getPerView();
  let index = 0;

  function getPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - perView);
  }

  function renderDots() {
    dotsWrap.innerHTML = '';
    const dotCount = maxIndex() + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Ir a la captura ${i + 1}`);
      if (i === index) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function update() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24; // 1.5rem
    track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
    renderDots();
  }

  function goTo(i) {
    index = Math.min(Math.max(i, 0), maxIndex());
    update();
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  // Navegación por teclado: flechas mueven el carrusel cuando tiene foco
  if (viewport) {
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(index - 1); }
    });
  }

  window.addEventListener('resize', () => {
    perView = getPerView();
    index = Math.min(index, maxIndex());
    update();
  }, { passive: true });

  update();

  /* ── Lightbox ── */
  const lightbox   = document.getElementById('lightbox');
  const lbContent  = document.getElementById('lightboxContent');
  const lbCaption  = document.getElementById('lightboxCaption');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');
  let lbIndex = 0;
  let lastFocusedEl = null;

  function openLightbox(i, triggerEl) {
    lbIndex = i;
    lastFocusedEl = triggerEl || document.activeElement;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    // Devolver el foco a la captura que abrió el lightbox
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function renderLightbox() {
    const card = cards[lbIndex];
    const img = card.querySelector('.screenshot-img').cloneNode(true);
    const captionMain = card.querySelector('.screenshot-caption').childNodes[0].textContent.trim();
    const captionDesc = card.querySelector('.screenshot-caption span')?.textContent || '';

    lbContent.innerHTML = '';
    lbContent.appendChild(img);
    lbCaption.innerHTML = `<strong>${captionMain}</strong><br>${captionDesc}`;
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i, card));
    // Enter o Espacio abren la captura enfocada (accesible por teclado)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i, card);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  lbPrev.addEventListener('click', () => { lbIndex = (lbIndex - 1 + cards.length) % cards.length; renderLightbox(); });
  lbNext.addEventListener('click', () => { lbIndex = (lbIndex + 1) % cards.length; renderLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
  });
})();


/* ─────────────────────────────────────
   19. VIDEO PLACEHOLDER — activación por teclado
   · El placeholder actúa como botón:
     Enter/Espacio disparan el mismo click
───────────────────────────────────── */
(function initVideoPlaceholderKeyboard() {
  const placeholder = document.getElementById('videoPlaceholder');
  if (!placeholder) return;

  placeholder.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      placeholder.click();
    }
  });
})();


/* ─────────────────────────────────────
   INIT — mensaje de consola
───────────────────────────────────── */
console.log(
  '%c◈ Penyy Royal Studio %c— Software libre de producción musical\nhttps://github.com/joaking777/PennyRoyalStudio — Contribuí al proyecto',
  'color: #8B1A1A; font-size: 14px; font-weight: bold; font-family: monospace;',
  'color: #6B6B6B; font-size: 11px; font-family: monospace;'
);
