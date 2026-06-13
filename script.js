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
      window._dawPlay && window._dawPlay();
    } else {
      icon.className = 'fas fa-play';
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
        other.querySelector('.faq-question').classList.remove('open');
        other.querySelector('.faq-answer').classList.remove('open');
      });
 
      // Si no estaba abierto, abrirlo
      if (!isOpen) {
        question.classList.add('open');
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
   · Click en capítulo → lo marca como activo
   · (Cuando tengas el video real podés
      conectar esto al iframe de YouTube
      usando la YouTube IFrame API para
      saltar al tiempo exacto)
───────────────────────────────────── */
(function initChapters() {
  const chapters = document.querySelectorAll('.chapter-item');
 
  chapters.forEach(chapter => {
    chapter.addEventListener('click', () => {
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
   INIT — mensaje de consola
───────────────────────────────────── */
console.log(
  '%c◈ Penny Royal Studio %c— Software libre de producción musical\nhttps://github.com — Contribuí al proyecto',
  'color: #8B1A1A; font-size: 14px; font-weight: bold; font-family: monospace;',
  'color: #6B6B6B; font-size: 11px; font-family: monospace;'
);