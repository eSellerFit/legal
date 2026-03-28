window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
});
