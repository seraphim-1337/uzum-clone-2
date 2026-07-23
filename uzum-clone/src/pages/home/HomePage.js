import { renderCard } from '../../components/ProductCard.js';
import { renderHero } from '../../components/Hero.js';
import { renderCategories } from '../../components/Categories.js';

export function renderProducts(products, favorites, formatPrice, title = 'Популярные товары') {
  const cards = products.map((product) => renderCard(product, favorites, formatPrice)).join('');
  return `<section class="products"><div class="section-title"><h2>${title}</h2><a href="#/catalog">Смотреть все →</a></div><div class="grid">${cards || '<p class="empty">Ничего не найдено. Попробуйте изменить запрос.</p>'}</div></section>`;
}

export function renderHomePage({ products, favorites, formatPrice, categories }) {
  return `<main class="wrap home">${renderHero()}${renderCategories(categories)}${renderProducts(products, favorites, formatPrice)}</main>`;
}
