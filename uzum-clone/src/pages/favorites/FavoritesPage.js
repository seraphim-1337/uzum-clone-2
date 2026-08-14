import '../../styles/favorites.css';
import emptyFavoriteIcon from '../../assets/empty-favorite.svg';

function favoriteDiscount(product) {
  if (product.discount) return product.discount;
  if (product.oldPrice && product.price < product.oldPrice) {
    return Math.round((1 - product.price / product.oldPrice) * 100);
  }
  return 0;
}

function renderFavoriteCard(product, formatPrice) {
  const reviews = Array.isArray(product.reviews) ? product.reviews.length : product.reviews || 0;
  const discount = favoriteDiscount(product);
  return `<article class="favorite-card" data-route="#/product/${product.id}">
    <button class="favorite-card__remove" data-fav="${product.id}" aria-label="Удалить из избранного">♡</button>
    <div class="favorite-card__image"><img src="${product.thumbnail}" alt="${product.title}" loading="lazy"></div>
    <div class="favorite-card__content">
      <p class="favorite-card__rating">★ ${product.rating} <span>(${reviews})</span></p>
      <h2>${product.title}</h2>
      <div class="favorite-card__prices">
        <div class="favorite-card__price-row">
          <strong>${formatPrice(product.price)}</strong>
          ${discount ? `<span class="favorite-card__discount">−${discount}%</span>` : ''}
        </div>
        ${product.oldPrice ? `<span class="favorite-card__old">${formatPrice(product.oldPrice)}</span>` : ''}
      </div>
      <button class="favorite-card__add" data-add="${product.id}">🛒 В корзину</button>
    </div>
  </article>`;
}

export function renderFavoritesPage({ products, favorites, formatPrice }) {
  const items = products.filter((product) => favorites.includes(product.id));
  if (items.length) {
    return `<main class="wrap page favorites-page">
      <div class="favorites-page__heading"><h1>Избранное</h1><span>${items.length} товаров</span></div>
      <div class="favorites-grid">${items.map((product) => renderFavoriteCard(product, formatPrice)).join('')}</div>
    </main>`;
  }
  return `<main class="wrap page favorites-page">
    <div class="favorites-page__heading"><h1>Избранное</h1></div>
    <div class="favorites-empty">
      <div><img class="favorites-empty__icon" src="${emptyFavoriteIcon}" alt="" aria-hidden="true"></div>
      <h2>У вас пока нет избранных товаров</h2>
      <p>Добавьте понравившиеся товары</p>
      <button data-route="#/catalog">Перейти в каталог</button>
    </div>
  </main>`;
}
