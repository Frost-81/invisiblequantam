(function() {
  var navbar = document.querySelector('.uui-navbar07_component');

  if (!navbar) {
    return;
  }

  var updateNavbarState = function() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateNavbarState();
  window.addEventListener('scroll', updateNavbarState, { passive: true });
})();
