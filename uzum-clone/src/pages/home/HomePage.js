import '../../styles/home.css';
import { renderCard } from '../../components/ProductCard.js';
import { renderPromoChips } from '../../components/Categories.js';
import { mountHeroSlider, renderHero } from '../../components/Hero.js';

let sectionObserver;
function mountLoadMore() { const button = document.querySelector('[data-home-load-more]'); const cards = [...document.querySelectorAll('[data-home-all-card]')]; if (!button) return; button.addEventListener('click', () => { cards.filter((card) => card.hidden).slice(0, 20).forEach((card) => { card.hidden = false; card.classList.add('home-all-card--visible'); }); if (!cards.some((card) => card.hidden)) button.remove(); }); }
function mountHomeAnimations() { sectionObserver?.disconnect(); const sections = document.querySelectorAll('[data-home-section]'); sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('home-section--visible'); sectionObserver.unobserve(entry.target); } }), { threshold: .12 }); sections.forEach((section) => sectionObserver.observe(section)); }
const sectionThemes = {
  popular: { icon: '🚀', eyebrow: 'ХИТЫ ПРОДАЖ' },
  new: { icon: '✨', eyebrow: 'НОВИНКИ' },
  sale: { icon: '🔥', eyebrow: 'ВЫГОДНЫЕ ПРЕДЛОЖЕНИЯ' },
  recommended: { icon: '💎', eyebrow: 'ПОДБОРКА ДЛЯ ВАС' },
  recent: { icon: '🕘', eyebrow: 'ИСТОРИЯ ПРОСМОТРОВ' },
};
const pluralize = (count) => { const mod10 = count % 10; const mod100 = count % 100; if (mod10 === 1 && mod100 !== 11) return 'товар'; if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара'; return 'товаров'; };
function renderProductRow(variant, title, products, favorites, formatPrice, cart = []) { const theme = sectionThemes[variant] || sectionThemes.popular; return `<section class="home-section home-section--${variant}" data-home-section><div class="home-section__top"><div class="home-section__heading"><span class="home-section__chip" aria-hidden="true">${theme.icon}</span><div class="home-section__titles"><p class="home-section__eyebrow">${theme.eyebrow}</p><h2>${title}</h2></div></div><div class="home-section__actions"><span class="home-section__count">${products.length} ${pluralize(products.length)}</span><a class="home-section__all" href="#/catalog">Смотреть все <span aria-hidden="true">→</span></a></div></div><div class="home-product-row">${products.map((product) => renderCard(product, favorites, formatPrice, cart)).join('')}</div></section>`; }
const isErrorProducts = (products) => products.length > 0 && !products[0].images;
const skeletonCard = () => `<div class="card sk-card"><div class="pic sk-pic"></div><div class="card-body"><i class="sk-line sk-line--title"></i><i class="sk-line sk-line--rate"></i><i class="sk-line sk-line--price"></i><i class="sk-line sk-line--btn"></i></div></div>`;
const skeletonRow = (count = 6) => Array.from({ length: count }, () => skeletonCard()).join('');
const productsErrorBlock = () => `<div class="products-error" data-products-error><span>⚠️</span><h2>Не удалось загрузить товары</h2><p>Проверьте подключение к интернету и попробуйте ещё раз</p><button type="button" class="products-error__retry" data-retry-products>Повторить</button></div>`;
function mountRetry() { const retry = document.querySelector('[data-retry-products]'); if (retry) retry.addEventListener('click', () => location.reload()); }
const safeRecentIds = () => { try { return JSON.parse(localStorage.getItem('uzum-recent') || '[]'); } catch { return []; } };
export function renderProducts(products, favorites, formatPrice, title = 'Популярные товары', cart = []) { return renderProductRow('popular', title, products, favorites, formatPrice, cart); }
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
  return `<main class="wrap home home--premium">${renderHero()}${renderPromoChips()}${recent.length ? renderProductRow('recent', 'Недавно просмотренные', recent, favorites, formatPrice, cart) : ''}${renderProductRow('popular', 'Популярное', popular, favorites, formatPrice, cart)}${renderProductRow('new', 'Новинки', newProducts.length ? newProducts : products.slice(2, 8), favorites, formatPrice, cart)}${renderProductRow('sale', 'Акции', sales, favorites, formatPrice, cart)}${renderProductRow('recommended', 'Рекомендуем вам', recommended, favorites, formatPrice, cart)}<section class="home-section home-section--catalog home-all-products" data-home-section><div class="home-section__top"><div class="home-section__heading"><span class="home-section__chip" aria-hidden="true">🗂️</span><div class="home-section__titles"><p class="home-section__eyebrow">ВЕСЬ КАТАЛОГ</p><h2>Все товары</h2></div></div><div class="home-section__actions"><span class="home-section__count">${products.length} ${pluralize(products.length)}</span><a class="home-section__all" href="#/catalog">Открыть каталог <span aria-hidden="true">→</span></a></div></div><div class="home-all-products__grid">${allProducts}</div>${products.length > 20 ? '<button class="home-all-products__more" data-home-load-more>Показать ещё 20</button>' : ''}</section></main>`;
}
