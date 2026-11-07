(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('lema-theme');
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
  root.dataset.theme = initialTheme;

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.theme-toggle');

    function updateToggle(theme) {
      const isDark = theme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      toggle.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
      toggle.firstElementChild.textContent = isDark ? '☀' : '☾';
    }

    updateToggle(initialTheme);
    toggle.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('lema-theme', theme);
      root.dataset.theme = theme;
      updateToggle(theme);
    });
  });
})();
