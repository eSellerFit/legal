function applySiteConfig() {
  if (!window.ESF_SITE) return;

  const linkMap = window.ESF_SITE.links || {};
  const legalMap = window.ESF_SITE.legal || {};

  document.querySelectorAll('[data-link]').forEach(el => {
    const key = el.getAttribute('data-link');
    if (key && linkMap[key]) {
      el.setAttribute('href', linkMap[key]);
    }
  });

  document.querySelectorAll('[data-legal]').forEach(el => {
    const key = el.getAttribute('data-legal');
    if (key && legalMap[key]) {
      el.setAttribute('href', legalMap[key]);
    }
  });
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  applySiteConfig();
});
