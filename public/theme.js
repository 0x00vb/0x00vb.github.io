const savedTheme = localStorage.getItem('valentino-theme');
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
document.addEventListener('keydown', () => {document.documentElement.dataset.input = 'keyboard';});
document.addEventListener('pointerdown', () => {document.documentElement.dataset.input = 'pointer';});
