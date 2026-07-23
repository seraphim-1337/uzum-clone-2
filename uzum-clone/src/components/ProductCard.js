let lastAddedId = null;

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  lastAddedId = Number(button.dataset.add);
  setTimeout(() => {
    const currentButton = document.querySelector(`[data-add="${lastAddedId}"]`);
    if (currentButton?.classList.contains('add--added')) {
      currentButton.classList.remove('add--added');
      currentButton.textContent = '🛒 В корзину';
    }
    lastAddedId = null;
  }, 1000);
}, true);

export function renderCard(product, favorites, formatPrice) {
  const isFavorite = favorites.includes(product.id);
  const isAdded = product.id === lastAddedId;
  return `<article class="card"><div class="pic"><img src="${product.image}" alt="${product.title}" loading="lazy"><button class="heart ${isFavorite ? 'on' : ''}" data-fav="${product.id}">♡</button><em>−${10 + product.id}%</em></div><div class="card-body"><p class="title">${product.title}</p><div class="rate">★ ${product.rating} <span>(${product.reviews})</span></div><small class="installment">от ${formatPrice(product.installment || Math.ceil(product.price / 12))}/мес.</small><strong>${formatPrice(product.price)}</strong><button class="add ${isAdded ? 'add--added' : ''}" data-add="${product.id}">${isAdded ? '✓ Добавлено' : '🛒 В корзину'}</button></div></article>`;
}
