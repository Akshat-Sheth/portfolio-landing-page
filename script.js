const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('main section[id]');
const navLinkMap = new Map(
  [...navLinks].map((link) => [link.getAttribute('href')?.replace('#', ''), link]),
);
const yearEl = document.getElementById('year');
const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');
const contactRecipient = contactForm?.dataset?.recipient || 'akshatsheth2001@gmail.com';

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

const activateNavLink = () => {
  const scrollPosition = window.scrollY + 140;
  let activeLink = null;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');

    if (!id) return;

    const matchingLink = navLinkMap.get(id);
    if (!matchingLink) return;

    if (scrollPosition >= top && scrollPosition < bottom) {
      activeLink = matchingLink;
    }
  });

  if (activeLink) {
    navLinks.forEach((link) => link.classList.toggle('active', link === activeLink));
  }
};

let navTicking = false;
window.addEventListener(
  'scroll',
  () => {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(() => {
      activateNavLink();
      navTicking = false;
    });
  },
  { passive: true },
);
activateNavLink();

let activeScrollFrame = null;

const smoothScrollTo = (targetY, duration = 900) => {
  if (activeScrollFrame) {
    cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;
  const startTime = performance.now();

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
    }
  };

  activeScrollFrame = requestAnimationFrame(step);
};

const internalLinks = document.querySelectorAll('a[href^="#"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

internalLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();

    const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 80);
    const distance = Math.abs(targetTop - window.scrollY);
    const duration = Math.max(520, Math.min(980, distance * 0.55));

    if (prefersReducedMotion) {
      window.scrollTo(0, targetTop);
    } else {
      smoothScrollTo(targetTop, duration);
    }

    if (window.location.hash !== href) {
      history.replaceState(null, '', href);
    }
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const message = String(formData.get('message') || '');

    const subject = encodeURIComponent(`Freelance Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject Details:\n${message}`);

    window.location.href = `mailto:${encodeURIComponent(contactRecipient)}?subject=${subject}&body=${body}`;

    if (formNote) {
      formNote.textContent = 'Opening your email app with your message draft.';
    }
  });
}