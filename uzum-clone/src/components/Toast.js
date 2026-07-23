export function showToast(text) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast__icon">✓</span><span class="toast__text">${text}</span>`;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => toast.classList.remove('toast--visible'), 2100);
  setTimeout(() => toast.remove(), 2400);
}
