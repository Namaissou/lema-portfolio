(function () {
  const sections = document.querySelectorAll('.design-section');
  const mobileViewport = window.matchMedia('(max-width: 680px)');

  function setSectionsForViewport() {
    sections.forEach(section => { section.open = !mobileViewport.matches; });
  }

  setSectionsForViewport();
  mobileViewport.addEventListener('change', setSectionsForViewport);
})();
