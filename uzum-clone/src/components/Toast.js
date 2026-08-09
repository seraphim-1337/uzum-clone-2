export function showToast(text, type = 'success') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast__icon">${type === 'error' ? '!' : '✓'}</span><span class="toast__text">${text}</span><i class="toast__progress"></i>`;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => toast.classList.remove('toast--visible'), 2800);
  setTimeout(() => toast.remove(), 3100);
}
