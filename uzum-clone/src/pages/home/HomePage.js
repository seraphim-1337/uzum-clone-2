import '../../styles/home.css';
import { renderCard } from '../../components/ProductCard.js';
import { renderPromoChips } from '../../components/Categories.js';
import { mountHeroSlider, renderHero } from '../../components/Hero.js';

let sectionObserver;
function mountLoadMore() { const button = document.querySelector('[data-home-load-more]'); const cards = [...document.querySelectorAll('[data-home-all-card]')]; if (!button) return; button.addEventListener('click', () => { cards.filter((card) => card.hidden).slice(0, 20).forEach((card) => { card.hidden = false; card.classList.add('home-all-card--visible'); }); if (!cards.some((card) => card.hidden)) button.remove(); }); }
function mountHomeAnimations() { sectionObserver?.disconnect(); const sections = document.querySelectorAll('[data-home-section]'); sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('home-section--visible'); sectionObserver.unobserve(entry.target); } }), { threshold: .12 }); sections.forEach((section) => sectionObserver.observe(section)); }
function renderProductRow(title, products, favorites, formatPrice, cart, modifier = '') { return `<section class="home-section ${modifier}" data-home-section><div class="home-section__heading"><div><p>${modifier === 'home-section--sale' ? 'ВЫГОДНЫЕ ПРЕДЛОЖЕНИЯ' : 'UZUM MARKET'}</p><h2>${title}</h2></div><a href="#/catalog">Смотреть все <span>→</span></a></div><div class="home-product-row">${products.map((product) => renderCard(product, favorites, formatPrice, cart)).join('')}</div></section>`; }
const isErrorProducts = (products) => products.length > 0 && !products[0].images;
const skeletonCard = () => `<div class="card sk-card"><div class="pic sk-pic"></div><div class="card-body"><i class="sk-line sk-line--title"></i><i class="sk-line sk-line--rate"></i><i class="sk-line sk-line--price"></i><i class="sk-line sk-line--btn"></i></div></div>`;
const skeletonRow = (count = 6) => Array.from({ length: count }, () => skeletonCard()).join('');
const productsErrorBlock = () => `<div class="products-error" data-products-error><span>⚠️</span><h2>Не удалось загрузить товары</h2><p>Проверьте подключение к интернету и попробуйте ещё раз</p><button type="button" class="products-error__retry" data-retry-products>Повторить</button></div>`;
function mountRetry() { const retry = document.querySelector('[data-retry-products]'); if (retry) retry.addEventListener('click', () => location.reload()); }
const safeRecentIds = () => { try { return JSON.parse(localStorage.getItem('uzum-recent') || '[]'); } catch { return []; } };
export function renderProducts(products, favorites, formatPrice, title = 'Популярные товары', cart = []) { return renderProductRow(title, products, favorites, formatPrice, cart); }
export function renderHomePage({ products, favorites, formatPrice, categories, cart = [] }) {
  if (isErrorProducts(products)) {
    setTimeout(() => { mountHeroSlider(); mountRetry(); }, 0);
    return `<main class="wrap home home--premium">${renderHero()}<section class="home-state home-state--error">${productsErrorBlock()}</section></main>`;
  }
  if (!products.length) {
    setTimeout(() => mountHeroSlider(), 0);
    return `<main class="wrap home home--premium">${renderHero()}<section class="home-state home-state--loading"><h2>Популярное</h2><div class="home-product-row home-product-row--loading">${skeletonRow(6)}</div><h2>Новинки</h2><div class="home-product-row home-product-row--loading">${skeletonRow(6)}</div><h2>Акции</h2><div class="home-product-row home-product-row--loading">${skeletonRow(6)}</div></section></main>`;
  }
  const popular = products.slice(0, 6); const newProducts = products.filter((product) => product.isNew).slice(0, 6); const sales = products.filter((product) => product.discount || product.oldPrice).slice(0, 6); const recentIds = safeRecentIds(); const recent = recentIds.map((id) => products.find((product) => product.id === id)).filter(Boolean).slice(0, 8); const recommended = products.filter((product) => !recent.some((recentProduct) => recentProduct.id === product.id)).slice(0, 8);
  setTimeout(() => { mountHomeAnimations(); mountHeroSlider(); mountLoadMore(); }, 0);
  const allProducts = products.map((product, index) => `<div data-home-all-card ${index >= 20 ? 'hidden' : ''}>${renderCard(product, favorites, formatPrice, cart)}</div>`).join('');
  return `<main class="wrap home home--premium">${renderHero()}${renderPromoChips()}${recent.length ? renderProductRow('Недавно просмотренные', recent, favorites, formatPrice, cart, 'home-section--recent') : ''}${renderProductRow('Популярное', popular, favorites, formatPrice, cart)}${renderProductRow('Новинки', newProducts.length ? newProducts : products.slice(2, 8), favorites, formatPrice, cart, 'home-section--new')}${renderProductRow('Акции', sales, favorites, formatPrice, cart, 'home-section--sale')}${renderProductRow('Рекомендуем вам', recommended, favorites, formatPrice, cart, 'home-section--recommended')}<section class="home-section home-all-products" data-home-section><div class="home-section__heading"><div><p>ВЕСЬ КАТАЛОГ</p><h2>Все товары</h2></div></div><div class="home-all-products__grid">${allProducts}</div>${products.length > 20 ? '<button class="home-all-products__more" data-home-load-more>Показать ещё 20</button>' : ''}</section></main>`;
}
