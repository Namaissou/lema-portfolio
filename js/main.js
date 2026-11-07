document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  document.querySelectorAll('.profile-photo').forEach(image => {
    const showPlaceholder = () => {
      image.closest('.profile-frame').classList.add('profile-missing');
    };

    image.addEventListener('error', showPlaceholder);
    if (image.complete && image.naturalWidth === 0) showPlaceholder();
  });

  document.querySelectorAll('.project-visual-image').forEach(image => {
    const showPlaceholder = () => {
      image.closest('.project-visual').classList.add('project-image-missing');
    };

    image.addEventListener('error', showPlaceholder);
    if (image.complete && image.naturalWidth === 0) showPlaceholder();
  });

  document.querySelectorAll('.skill-token img').forEach(image => {
    const hideMissingLogo = () => image.remove();
    image.addEventListener('error', hideMissingLogo);
    if (image.complete && image.naturalWidth === 0) hideMissingLogo();
  });

  const skillClouds = [...document.querySelectorAll('.skill-cloud-canvas')];
  if (skillClouds.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const shuffle = items => {
      const shuffled = [...items];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const index = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[index]] = [shuffled[index], shuffled[i]];
      }
      return shuffled;
    };

    const scatter = (cloud, instant = false) => {
      const tokens = [...cloud.querySelectorAll('.skill-token')];
      if (!tokens.length) return;
      if (instant) cloud.classList.add('is-resizing');

      const gap = 16;
      const tokenWidth = tokens[0].offsetWidth;
      const tokenHeight = tokens[0].offsetHeight;
      const columns = Math.max(1, Math.floor((cloud.clientWidth + gap) / (tokenWidth + gap)));
      const rows = Math.ceil(tokens.length / columns);
      const height = Math.max(250, rows * tokenHeight + (rows - 1) * gap);
      const startX = Math.max(0, (cloud.clientWidth - (columns * tokenWidth + (columns - 1) * gap)) / 2);
      const startY = Math.max(0, (height - (rows * tokenHeight + (rows - 1) * gap)) / 2);
      const slots = tokens.map((_, index) => ({
        left: startX + (index % columns) * (tokenWidth + gap),
        top: startY + Math.floor(index / columns) * (tokenHeight + gap)
      }));

      cloud.style.height = `${height}px`;
      cloud.classList.add('is-floating');
      shuffle(slots).forEach((slot, index) => {
        tokens[index].style.left = `${slot.left}px`;
        tokens[index].style.top = `${slot.top}px`;
      });
      if (instant) {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => cloud.classList.remove('is-resizing')));
      }
    };

    skillClouds.forEach(cloud => {
      scatter(cloud, true);
      const move = () => {
        scatter(cloud);
        window.setTimeout(move, 2200 + Math.random() * 1800);
      };
      window.setTimeout(move, 1500 + Math.random() * 1800);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => skillClouds.forEach(cloud => scatter(cloud, true)), 150);
    });
  }

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealItems = document.querySelectorAll('main > section, .project-row, .design-card');
  revealItems.forEach(item => item.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));
});
