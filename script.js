/* ─── Script: Theme toggle, scroll reveals, skill bar animation ─── */

(() => {
  'use strict';

  /* ── Theme ──────────────────────────────────────────────────── */
  const root = document.documentElement;
  const btn  = document.getElementById('themeBtn');

  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme  = () => localStorage.getItem('kg-theme');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('kg-theme', theme);
  }

  // Initialise without flash — runs synchronously before paint
  const initial = savedTheme() ?? (prefersDark() ? 'dark' : 'light');
  applyTheme(initial);

  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // Respect system preference changes when no manual preference saved
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!savedTheme()) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ── Nav scroll state ───────────────────────────────────────── */
  const nav = document.getElementById('nav');

  const onScroll = () => {
    if (window.scrollY > 20) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ── Scroll reveal (IntersectionObserver) ───────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Bento grid reveal (stagger children) ───────────────────── */
  const bentoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          bentoObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  document.querySelectorAll('.bento').forEach(el => bentoObserver.observe(el));

  /* ── Skill tiles — staggered entrance on scroll ────────────── */
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-tile').forEach((tile, i) => {
            tile.style.opacity = '0';
            tile.style.transform = 'translateY(12px)';
            setTimeout(() => {
              tile.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
              tile.style.opacity = '1';
              tile.style.transform = 'translateY(0)';
            }, i * 55);
          });
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.scb').forEach(el => skillObserver.observe(el));

  /* ── Smooth anchor scroll ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 72; // nav height
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ── Marquee pause on hover ─────────────────────────────────── */
  const track = document.querySelector('.marquee-track');
  const wrap  = document.querySelector('.marquee-wrap');

  wrap?.addEventListener('mouseenter', () => {
    if (track) track.style.animationPlayState = 'paused';
  });
  wrap?.addEventListener('mouseleave', () => {
    if (track) track.style.animationPlayState = 'running';
  });

  /* ── Hero headline character split (stagger) ────────────────── */
  function staggerHeadline() {
    const lines = document.querySelectorAll('.hero-headline .line-1, .hero-headline .line-3');
    lines.forEach((line, i) => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(24px)';
      line.style.transition = `opacity 0.7s ${0.2 + i * 0.15}s cubic-bezier(0.4,0,0.2,1), transform 0.7s ${0.2 + i * 0.15}s cubic-bezier(0.4,0,0.2,1)`;
      requestAnimationFrame(() => {
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      });
    });

    const line2 = document.querySelector('.hero-headline .line-2');
    if (line2) {
      line2.style.opacity = '0';
      line2.style.transform = 'translateY(24px)';
      line2.style.transition = 'opacity 0.7s 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.7s 0.35s cubic-bezier(0.4,0,0.2,1)';
      requestAnimationFrame(() => {
        line2.style.opacity = '1';
        line2.style.transform = 'translateY(0)';
      });
    }
  }

  // Run after fonts are loaded for accurate layout
  if (document.fonts?.ready) {
    document.fonts.ready.then(staggerHeadline);
  } else {
    window.addEventListener('load', staggerHeadline);
  }

  /* ── Subtle parallax on hero blobs ─────────────────────────── */
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const blobs = document.querySelectorAll('.canvas-blob');
        blobs.forEach((blob, i) => {
          const speed = 0.08 + i * 0.04;
          blob.style.transform = `translateY(${y * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── Active nav link highlight ──────────────────────────────── */
  const sections = document.querySelectorAll('section[id], footer');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const activeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => {
            a.style.color = '';
            a.style.background = '';
            if (a.getAttribute('href') === `#${entry.target.id}`) {
              a.style.color = 'var(--indigo)';
              a.style.background = 'rgba(91,94,244,0.07)';
            }
          });
        }
      });
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );

  sections.forEach(s => activeObserver.observe(s));

})();
