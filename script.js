const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navList = document.querySelector('.nav-list');
const yearSpan = document.getElementById('year');

// Set current year
yearSpan.textContent = new Date().getFullYear();

// Theme handling
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  if (theme === 'light') {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

if (storedTheme) {
  setTheme(storedTheme);
} else {
  setTheme(prefersDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Mobile menu
mobileMenuToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  mobileMenuToggle.classList.toggle('open', isOpen);
  mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    mobileMenuToggle.classList.remove('open');
    mobileMenuToggle.setAttribute('aria-label', 'Open menu');
  });
});

// Update active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveLink() {
  const scrollY = window.scrollY;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
      });
    }
  });
}

window.addEventListener('scroll', setActiveLink);
setActiveLink();

// News "Load more" — reveals 6 more hidden posts at a time
const newsGrid = document.getElementById('news-grid');
const newsLoadMore = document.getElementById('news-load-more');

if (newsGrid && newsLoadMore) {
  const batchSize = 6;
  const cards = Array.from(newsGrid.querySelectorAll('.news-card'));

  cards.forEach((card, index) => {
    if (index >= batchSize) {
      card.classList.add('hidden');
    }
  });

  if (cards.length <= batchSize) {
    newsLoadMore.classList.add('hidden');
  }

  newsLoadMore.addEventListener('click', () => {
    const hiddenCards = newsGrid.querySelectorAll('.news-card.hidden');
    for (let i = 0; i < batchSize && i < hiddenCards.length; i++) {
      hiddenCards[i].classList.remove('hidden');
    }
    if (newsGrid.querySelectorAll('.news-card.hidden').length === 0) {
      newsLoadMore.classList.add('hidden');
    }
  });
}
