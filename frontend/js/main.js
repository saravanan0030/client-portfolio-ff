const localApiFallback = 'http://127.0.0.1:5000';
const config = window.APP_CONFIG || {};
const isLocalPage = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE = config.apiBase || (isLocalPage ? localApiFallback : window.location.origin);
const UPLOAD_BASE = config.uploadBase || API_BASE;

if (!config.apiBase && !isLocalPage) {
  console.warn('No backend API configured in config.js. Uploads may fail unless the frontend and backend share the same origin or BACKEND_URL is set.');
}

console.info('Frontend config:', { apiBase: API_BASE, uploadBase: UPLOAD_BASE, locationOrigin: window.location.origin, locationHref: window.location.href });

function mediaUrl(path) {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/assets/uploads/')) {
    return `${UPLOAD_BASE}${normalized}`;
  }
  return path.startsWith('/') ? path : path;
}

const ICONS = {
  skull: '💀', trophy: '🏆', crosshair: '🎯', star: '⭐', gamepad: '🎮', chart: '📊',
};
const DELETE_PASSWORD = '123456';
const WEAPON_ICONS = {
  awm: '🔭', m1014: '💥', groza: '🔫', mp40: '⚡', deagle: '🎯', m249: '🔥',
};
const BADGE_ICONS = {
  gold: '🥇', silver: '🥈', platinum: '💎',
};

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initParticles();
  initHudTilt();
  initTiltCards();
  initMagnetic();
  initTextScramble();
  initHeroCounters();
  loadStats();
  loadAchievements();
  loadWeapons();
  loadGallery();
  loadVideos();
  initLightbox();
  initGalleryFilters();
  initFileDrops();
  initPhotoUpload();
  initVideoUpload();
  initContactForm();
});

let galleryPhotos = [];
let galleryIndex = 0;

/* ===== Preloader ===== */
function initPreloader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      preloader.style.opacity = '0';
      preloader.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      preloader.style.transform = 'scale(1.1)';
      setTimeout(() => preloader.remove(), 600);
    }, 1600);
  });
}

/* ===== Custom Cursor ===== */
function initCursor() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .tilt-card, .weapon-card, .magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ===== Scroll Progress ===== */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrollTop / docHeight) * 100 + '%';
  });
}

/* ===== Navbar ===== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 200) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active-nav', link.getAttribute('href') === '#' + current);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('mobileMenu').classList.add('hidden');
        document.getElementById('menuBtn').classList.remove('active');
      }
    });
  });
}

function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('hidden');
  });
}

/* ===== Scroll Reveal ===== */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }),
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

/* ===== Particles — Ember Style ===== */
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function create() {
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 20), 50);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.8 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        hue: Math.random() > 0.5 ? 25 : 0,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.opacity -= 0.001;

      if (p.y < -10 || p.opacity <= 0) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
        p.opacity = Math.random() * 0.6 + 0.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${p.opacity})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${p.opacity * 0.15})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(draw);
  }

  resize();
  create();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    create();
    draw();
  });
}

/* ===== HUD Card 3D Tilt ===== */
function initHudTilt() {
  const card = document.getElementById('hudCardInner');
  if (!card || window.matchMedia('(max-width: 768px)').matches) return;

  const parent = document.getElementById('hudCard');
  parent.addEventListener('mousemove', e => {
    const rect = parent.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
  });
  parent.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0) rotateX(0)';
    card.style.transition = 'transform 0.5s ease';
  });
  parent.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease';
  });
}

/* ===== Tilt Cards ===== */
function initTiltCards() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
      const rotX = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

/* ===== Magnetic Buttons ===== */
function initMagnetic() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease';
    });
  });
}

/* ===== Text Scramble on Hero Subtitle ===== */
function initTextScramble() {
  const el = document.getElementById('heroSubtitle');
  if (!el) return;
  const words = ['PLAYER', 'CHAMPION', 'LEGEND', 'SNIPER', 'PLAYER'];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  let wordIndex = 0;

  setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    const target = words[wordIndex];
    let iteration = 0;
    const interval = setInterval(() => {
      el.textContent = target
        .split('')
        .map((char, i) => {
          if (i < iteration) return target[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      iteration += 0.5;
      if (iteration >= target.length) clearInterval(interval);
    }, 40);
  }, 4000);
}

/* ===== Hero Counter Animation ===== */
function initHeroCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isFloat = target % 1 !== 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    setTimeout(() => requestAnimationFrame(update), 1800);
  });
}

/* ===== Counter for Stats ===== */
function animateCounter(el, value) {
  const numMatch = value.match(/[\d.]+/);
  if (!numMatch) { el.textContent = value; return; }

  const num = parseFloat(numMatch[0]);
  const prefix = value.slice(0, numMatch.index);
  const suffix = value.slice(numMatch.index + numMatch[0].length);
  const isFloat = num % 1 !== 0;
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = eased * num;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function observeStaggerItems(items) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const counter = entry.target.querySelector('.stat-value[data-value]');
          if (counter && !counter.dataset.animated) {
            counter.dataset.animated = 'true';
            animateCounter(counter, counter.dataset.value);
          }
        }
      });
    },
    { threshold: 0.1 }
  );
  items.forEach(item => observer.observe(item));
}

/* ===== Load Data ===== */
async function loadStats() {
  const grid = document.getElementById('statsGrid');
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    const stats = await res.json();
    grid.innerHTML = stats.map((s, i) => renderStatCard(s, i)).join('');
  } catch {
    grid.innerHTML = getFallbackStats();
  }
  observeStaggerItems(grid.querySelectorAll('.stagger-item'));
}

function renderStatCard(s, i) {
  return `
    <div class="stat-card stagger-item" style="transition-delay:${i * 80}ms">
      <span class="stat-icon">${ICONS[s.icon] || '📊'}</span>
      <div class="stat-value" data-value="${s.value}">0</div>
      <div class="stat-label">${s.label}</div>
    </div>`;
}

function getFallbackStats() {
  return [
    { label: 'Total Kills', value: '12,450+', icon: 'skull' },
    { label: 'Win Rate', value: '68%', icon: 'trophy' },
    { label: 'Headshots', value: '4,200+', icon: 'crosshair' },
    { label: 'Rank', value: 'Heroic', icon: 'star' },
    { label: 'Matches', value: '3,800+', icon: 'gamepad' },
    { label: 'KD Ratio', value: '4.2', icon: 'chart' },
  ].map((s, i) => renderStatCard(s, i)).join('');
}

async function loadAchievements() {
  const grid = document.getElementById('achievementsGrid');
  try {
    const res = await fetch(`${API_BASE}/api/achievements`);
    const achievements = await res.json();
    grid.innerHTML = achievements.map((a, i) => renderAchievement(a, i)).join('');
  } catch {
    grid.innerHTML = getFallbackAchievements();
  }
  observeStaggerItems(grid.querySelectorAll('.stagger-item'));
}

function renderAchievement(a, i) {
  return `
    <div class="achievement-card ${a.badge} stagger-item" style="transition-delay:${i * 100}ms">
      <div class="achievement-badge ${a.badge}">${BADGE_ICONS[a.badge] || '🏅'}</div>
      <span class="text-[10px] text-ff-orange font-bold tracking-[0.2em] uppercase">${a.year}</span>
      <h3 class="font-orbitron text-lg font-bold mt-3 mb-2">${a.title}</h3>
      <p class="text-gray-500 text-sm leading-relaxed">${a.description}</p>
    </div>`;
}

function getFallbackAchievements() {
  return [
    { title: 'Booyah Master', description: '100+ consecutive Booyah wins in ranked mode', year: '2025', badge: 'gold' },
    { title: 'Sniper Elite', description: 'Top 1% headshot accuracy across all seasons', year: '2024', badge: 'silver' },
    { title: 'Clutch King', description: '50+ 1v4 clutch victories in Grandmaster', year: '2025', badge: 'gold' },
    { title: 'Tournament Champion', description: '1st place in regional Free Fire championship', year: '2024', badge: 'gold' },
    { title: 'MVP Season 42', description: 'Most Valuable Player in Season 42 ranked', year: '2025', badge: 'platinum' },
  ].map((a, i) => renderAchievement(a, i)).join('');
}

async function loadWeapons() {
  const grid = document.getElementById('weaponsGrid');
  try {
    const res = await fetch(`${API_BASE}/api/weapons`);
    const weapons = await res.json();
    grid.innerHTML = weapons.map((w, i) => renderWeapon(w, i)).join('');
  } catch {
    grid.innerHTML = getFallbackWeapons();
  }
  observeStaggerItems(grid.querySelectorAll('.stagger-item'));
}

function renderWeapon(w, i) {
  return `
    <div class="weapon-card stagger-item" style="transition-delay:${i * 70}ms">
      <span class="weapon-icon">${WEAPON_ICONS[w.image_url] || '🔫'}</span>
      <h4 class="font-orbitron font-bold text-xs tracking-wider">${w.name}</h4>
      <p class="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">${w.type}</p>
      <span class="weapon-damage ${w.damage.toLowerCase().replace(' ', '-')}">${w.damage}</span>
    </div>`;
}

function getFallbackWeapons() {
  return [
    { name: 'AWM', type: 'Sniper', damage: 'High', image_url: 'awm' },
    { name: 'M1014', type: 'Shotgun', damage: 'Very High', image_url: 'm1014' },
    { name: 'Groza', type: 'AR', damage: 'High', image_url: 'groza' },
    { name: 'MP40', type: 'SMG', damage: 'Medium', image_url: 'mp40' },
    { name: 'Desert Eagle', type: 'Pistol', damage: 'High', image_url: 'deagle' },
    { name: 'M249', type: 'LMG', damage: 'High', image_url: 'm249' },
  ].map((w, i) => renderWeapon(w, i)).join('');
}

/* ===== Gallery ===== */
async function loadGallery() {
  const grid = document.getElementById('galleryGrid');
  try {
    const res = await fetch(`${API_BASE}/api/photos`);
    galleryPhotos = await res.json();
  } catch {
    galleryPhotos = getFallbackPhotos();
  }
  renderGallery('all');
}

function getFallbackPhotos() {
  return [
    { id: 'fallback-photo-0', title: 'Tournament Victory', description: 'Regional championship finals', file_path: 'assets/images/gallery-1.svg', category: 'tournament' },
    { id: 'fallback-photo-1', title: 'Squad Wipe Clutch', description: '1v4 clutch in ranked', file_path: 'assets/images/gallery-2.svg', category: 'gameplay' },
    { id: 'fallback-photo-2', title: 'AWM Headshot', description: '300m sniper headshot', file_path: 'assets/images/gallery-3.svg', category: 'sniper' },
    { id: 'fallback-photo-3', title: 'Team Phoenix', description: 'Squad photo after win', file_path: 'assets/images/gallery-4.svg', category: 'team' },
    { id: 'fallback-photo-4', title: 'Heroic Rank', description: 'Season 43 achievement', file_path: 'assets/images/gallery-5.svg', category: 'ranked' },
    { id: 'fallback-photo-5', title: 'Streaming Setup', description: 'Live gaming setup', file_path: 'assets/images/gallery-6.svg', category: 'content' },
  ];
}

function renderGallery(filter) {
  const grid = document.getElementById('galleryGrid');
  const filtered = filter === 'all'
    ? galleryPhotos
    : galleryPhotos.filter(p => p.category === filter);

  grid.innerHTML = filtered.map((p, i) => {
    const itemId = p.id || `fallback-photo-${i}`;
    return `
    <div class="gallery-item stagger-item" data-category="${p.category}" data-index="${galleryPhotos.indexOf(p)}" style="transition-delay:${i * 60}ms">
      <img src="${mediaUrl(p.file_path)}" alt="${p.title}" loading="lazy" />
      <div class="gallery-zoom">🔍</div>
      <button type="button" class="media-delete-btn" data-id="${itemId}" title="Delete photo" aria-label="Delete photo">✕</button>
      <div class="gallery-overlay">
        <span class="gallery-cat">${p.category}</span>
        <h4 class="font-orbitron font-bold text-sm">${p.title}</h4>
        <p class="text-xs text-gray-400 mt-1">${p.description || ''}</p>
      </div>
    </div>
  `;
  }).join('');

  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
  });
  grid.querySelectorAll('.media-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deletePhoto(btn.dataset.id);
    });
  });
  observeStaggerItems(grid.querySelectorAll('.stagger-item'));
}

function initGalleryFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(btn.dataset.filter);
    });
  });
}

/* ===== Lightbox ===== */
function initLightbox() {
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  galleryIndex = index;
  const photo = galleryPhotos[index];
  if (!photo) return;

  document.getElementById('lightboxImg').src = mediaUrl(photo.file_path);
  document.getElementById('lightboxImg').alt = photo.title;
  document.getElementById('lightboxTitle').textContent = photo.title;
  document.getElementById('lightboxDesc').textContent = photo.description || '';
  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  galleryIndex = (galleryIndex + dir + galleryPhotos.length) % galleryPhotos.length;
  openLightbox(galleryIndex);
}

/* ===== Videos ===== */
let allVideos = [];

async function loadVideos() {
  try {
    const res = await fetch(`${API_BASE}/api/videos`);
    allVideos = await res.json();
  } catch {
    allVideos = getFallbackVideos();
  }

  renderVideoGrid();

  if (allVideos.length > 0) playVideo(0);
}

function getFallbackVideos() {
  return [
    { id: 'fallback-video-0', title: 'Booyah Highlights', description: 'Free Fire best moments', video_url: 'https://www.youtube.com/watch?v=1Hs3X3x4zUg', thumbnail: 'assets/images/video-thumb-1.svg', category: 'highlight' },
    { id: 'fallback-video-1', title: 'AWM Montage', description: 'Free Fire sniper montage', video_url: 'https://www.youtube.com/watch?v=Qw4xM5FZ2WQ', thumbnail: 'assets/images/video-thumb-2.svg', category: 'montage' },
    { id: 'fallback-video-2', title: 'Tournament Finals', description: 'Free Fire final match replay', video_url: 'https://www.youtube.com/watch?v=8k9ZG3bF14E', thumbnail: 'assets/images/video-thumb-3.svg', category: 'tournament' },
    { id: 'fallback-video-3', title: 'Clutch King', description: 'Free Fire 1v4 clutch plays', video_url: 'https://www.youtube.com/watch?v=5t7M2K1L8PQ', thumbnail: 'assets/images/video-thumb-4.svg', category: 'clutch' },
  ];
}

function renderVideoCard(v, i) {
  const thumb = v.thumbnail || 'assets/images/video-thumb-1.svg';
  const itemId = v.id || `fallback-video-${i}`;
  return `
    <div class="video-card stagger-item" data-index="${i}" data-id="${itemId}" style="transition-delay:${i * 80}ms">
      <div class="video-thumb">
        <img src="${mediaUrl(thumb)}" alt="${v.title}" loading="lazy" />
        <div class="video-play-btn">▶</div>
        <button type="button" class="media-delete-btn" data-id="${itemId}" title="Delete video" aria-label="Delete video">✕</button>
        <span class="video-duration">${v.category || 'video'}</span>
      </div>
      <div class="video-info">
        <h4>${v.title}</h4>
        <p>${v.description || ''}</p>
      </div>
    </div>`;
}

function renderVideoGrid() {
  const grid = document.getElementById('videosGrid');
  grid.innerHTML = allVideos.map((v, i) => renderVideoCard(v, i)).join('');
  grid.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => playVideo(parseInt(card.dataset.index)));
  });
  grid.querySelectorAll('.media-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteVideo(btn.dataset.id);
    });
  });
  observeStaggerItems(grid.querySelectorAll('.stagger-item'));
}

function playVideo(index) {
  const video = allVideos[index];
  if (!video) return;

  document.querySelectorAll('.video-card').forEach((c, i) => {
    c.classList.toggle('active', i === index);
  });

  document.getElementById('featuredVideoTitle').textContent = video.title;
  const wrap = document.getElementById('videoPlayerWrap');

  if (video.file_path) {
    wrap.innerHTML = `<video controls autoplay playsinline><source src="${mediaUrl(video.file_path)}" type="video/mp4">Your browser does not support video.</video>`;
  } else if (video.video_url) {
    let url = video.video_url;
    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v');
      url = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      url = `https://www.youtube.com/embed/${id}`;
    }
    wrap.innerHTML = `<iframe src="${url}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    wrap.innerHTML = `<div class="video-placeholder"><div class="play-icon-lg">▶</div><p class="text-gray-500 text-sm mt-4">No video source available</p></div>`;
  }

  document.getElementById('featuredVideo').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ===== Delete Media ===== */
async function deletePhoto(id) {
  const password = prompt('Enter the 6-digit delete password for photos:');
  if (!password) return;
  if (password.trim() !== DELETE_PASSWORD) {
    alert('Incorrect delete password.');
    return;
  }
  if (!confirm('Delete this photo? This cannot be undone.')) return;

  if (typeof id === 'string' && id.startsWith('fallback-photo-')) {
    galleryPhotos = galleryPhotos.filter(photo => photo.id !== id);
    renderGallery('all');
    closeLightbox();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/photos/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok) {
      closeLightbox();
      await loadGallery();
    } else {
      alert(result.error || 'Failed to delete photo.');
    }
  } catch {
    alert('Failed to delete photo. Check server connection.');
  }
}

async function deleteVideo(id) {
  const password = prompt('Enter the 6-digit delete password for videos:');
  if (!password) return;
  if (password.trim() !== DELETE_PASSWORD) {
    alert('Incorrect delete password.');
    return;
  }
  if (!confirm('Delete this video? This cannot be undone.')) return;

  if (typeof id === 'string' && id.startsWith('fallback-video-')) {
    allVideos = allVideos.filter(video => video.id !== id);
    renderVideoGrid();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/videos/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (res.ok) {
      await loadVideos();
    } else {
      alert(result.error || 'Failed to delete video.');
    }
  } catch {
    alert('Failed to delete video. Check server connection.');
  }
}

/* ===== File Drop Zones ===== */
function initFileDrops() {
  setupFileDrop('photoDrop', 'photoFile', 'photoFileName');
  setupFileDrop('videoDrop', 'videoFile', 'videoFileName');
  setupFileDrop('thumbDrop', 'videoThumb', 'thumbFileName');
  setupFileDrop('contactDrop', 'attachment', 'attachmentFileName');
}

function setupFileDrop(dropId, inputId, nameId) {
  const drop = document.getElementById(dropId);
  const input = document.getElementById(inputId);
  const nameEl = document.getElementById(nameId);
  if (!drop || !input) return;

  ['dragenter', 'dragover'].forEach(evt => {
    drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(evt => {
    drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.remove('dragover'); });
  });
  drop.addEventListener('drop', e => {
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      nameEl.textContent = e.dataTransfer.files[0].name;
    }
  });
  input.addEventListener('change', () => {
    nameEl.textContent = input.files[0] ? input.files[0].name : '';
  });
}

/* ===== Photo Upload ===== */
function initPhotoUpload() {
  const form = document.getElementById('photoUploadForm');
  const status = document.getElementById('photoUploadStatus');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    status.classList.remove('hidden', 'upload-success', 'upload-error');
    status.textContent = 'Uploading...';

    try {
      const res = await fetch(`${API_BASE}/api/upload/photo`, { method: 'POST', body: formData });
      let result = null;
      try {
        result = await res.json();
      } catch (parseErr) {
        console.warn('Photo upload response parse failed:', parseErr);
      }

      if (res.ok) {
        status.classList.add('upload-success');
        status.textContent = 'Photo uploaded successfully!';
        form.reset();
        document.getElementById('photoFileName').textContent = '';
        await loadGallery();
      } else {
        status.classList.add('upload-error');
        status.textContent = result?.error || result?.message || `Upload failed (${res.status} ${res.statusText}).`;
        if (!result) {
          const raw = await res.text();
          console.error('Photo upload failed response:', res.status, res.statusText, raw);
        }
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      status.classList.add('upload-error');
      status.textContent = `Upload failed. ${err.message || 'Check server connection.'}`;
    }
    setTimeout(() => status.classList.add('hidden'), 4000);
  });
}

/* ===== Video Upload ===== */
function initVideoUpload() {
  const form = document.getElementById('videoUploadForm');
  const status = document.getElementById('videoUploadStatus');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const hasFile = formData.get('file')?.size > 0;
    const hasUrl = formData.get('video_url')?.trim();

    if (!hasFile && !hasUrl) {
      status.classList.remove('hidden');
      status.classList.add('upload-error');
      status.textContent = 'Upload a video file or enter a YouTube URL.';
      return;
    }

    status.classList.remove('hidden', 'upload-success', 'upload-error');
    status.textContent = 'Uploading...';

    try {
      const res = await fetch(`${API_BASE}/api/upload/video`, { method: 'POST', body: formData });
      let result = null;
      try {
        result = await res.json();
      } catch (parseErr) {
        console.warn('Video upload response parse failed:', parseErr);
      }

      if (res.ok) {
        status.classList.add('upload-success');
        status.textContent = 'Video uploaded successfully!';
        form.reset();
        document.getElementById('videoFileName').textContent = '';
        document.getElementById('thumbFileName').textContent = '';
        await loadVideos();
      } else {
        status.classList.add('upload-error');
        status.textContent = result?.error || result?.message || `Upload failed (${res.status} ${res.statusText}).`;
        if (!result) {
          const raw = await res.text();
          console.error('Video upload failed response:', res.status, res.statusText, raw);
        }
      }
    } catch (err) {
      console.error('Video upload error:', err);
      status.classList.add('upload-error');
      status.textContent = `Upload failed. ${err.message || 'Check server connection.'}`;
    }
    setTimeout(() => status.classList.add('hidden'), 4000);
  });
}

/* ===== Contact Form ===== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const btn = document.getElementById('submitBtn');
  if (!form || !status || !btn) {
    console.warn('Contact form initialization skipped: missing form or button elements.');
    return;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Transmitting...';

    const attachment = document.getElementById('attachment');
    const hasFile = attachment?.files?.length > 0;

    try {
      let res, result;

      if (hasFile) {
        const formData = new FormData();
        formData.append('name', form.name.value.trim());
        formData.append('email', form.email.value.trim());
        formData.append('subject', form.subject.value.trim());
        formData.append('message', form.message.value.trim());
        formData.append('attachment', attachment.files[0]);
        res = await fetch(`${API_BASE}/api/contact`, { method: 'POST', body: formData });
      } else {
        res = await fetch(`${API_BASE}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim(),
          }),
        });
      }

      result = await res.json();
      status.classList.remove('hidden', 'bg-red-500/20', 'text-red-400', 'bg-green-500/20', 'text-green-400');

      if (res.ok) {
        status.classList.add('bg-green-500/20', 'text-green-400');
        const senderEmail = form.email.value.trim();
        status.textContent = result.message || `Message sent successfully from ${senderEmail}!`;
        form.reset();
        document.getElementById('attachmentFileName').textContent = '';
      } else {
        status.classList.add('bg-red-500/20', 'text-red-400');
        status.textContent = result.error || 'Something went wrong.';
      }
    } catch (error) {
      console.error('Contact submit failed:', error);
      status.classList.remove('hidden');
      status.classList.add('bg-red-500/20', 'text-red-400');
      status.textContent = 'Failed to send your message. Please check your connection and try again.';
    }

    btn.disabled = false;
    btn.querySelector('span').textContent = 'Send Message';
    setTimeout(() => status.classList.add('hidden'), 5000);
  });
}
