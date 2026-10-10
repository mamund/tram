const button = document.getElementById('copy');
button?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('npm install -g @mamund/tram@beta');
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = 'Copy'; }, 1800);
  } catch {
    button.textContent = 'Select and copy';
  }
});
