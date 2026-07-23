import { renderCard } from '../../components/ProductCard.js';
import '../../styles/catalog.css';

export function filterProducts(products, filters) {
  const query = filters.query.trim().toLowerCase();
  return products.filter((product) => !query || product.title.toLowerCase().includes(query))
    .filter((product) => filters.category === 'all' || product.category === filters.category);
}

export function sortProducts(products, sort) {
  return [...products].sort((first, second) => {
    if (sort === 'price-asc') return first.price - second.price;
    if (sort === 'price-desc') return second.price - first.price;
    if (sort === 'rating') return Number(second.rating) - Number(first.rating);
    if (sort === 'name') return first.title.localeCompare(second.title, 'ru');
    return (second.reviews || 0) - (first.reviews || 0) || Number(second.rating) - Number(first.rating);
  });
}

export function renderFilters(categories) {
  return `<aside class="catalog-filters"><div class="filter-heading"><b>Категории</b><button type="button" data-catalog-reset>Сбросить</button></div><div class="catalog-categories"><button type="button" class="catalog-category is-active" data-catalog-category="all">Все</button>${categories.map((category) => `<button type="button" class="catalog-category" data-catalog-category="${category}">${category}</button>`).join('')}</div></aside>`;
}

function renderProductGrid(products, favorites, formatPrice) {
  return products.map((product, index) => `<div class="catalog-product" data-product-index="${index}" data-title="${product.title.toLowerCase()}" data-category="${product.category || ''}" data-price="${product.price}" data-rating="${product.rating || 0}" data-reviews="${product.reviews || 0}">${renderCard(product, favorites, formatPrice)}</div>`).join('');
}

function mountCatalog(products) {
  const root = document.querySelector('[data-catalog-root]');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  const state = { query: '', category: 'all', sort: 'popular' };
  const search = root.querySelector('[data-catalog-search]');
  const sort = root.querySelector('[data-catalog-sort]');
  const counter = root.querySelector('[data-catalog-count]');
  const grid = root.querySelector('[data-catalog-grid]');
  const empty = root.querySelector('[data-catalog-empty]');
  const categoryButtons = [...root.querySelectorAll('[data-catalog-category]')];
  const cards = [...root.querySelectorAll('.catalog-product')];

  const update = () => {
    const visible = sortProducts(filterProducts(products, state), state.sort);
    const visibleIndexes = new Set(visible.map((product) => products.indexOf(product)));
    cards.forEach((card, index) => { card.hidden = !visibleIndexes.has(index); });
    visible.forEach((product) => grid.append(cards[products.indexOf(product)]));
    counter.textContent = `Найдено товаров: ${visible.length}`;
    empty.hidden = visible.length !== 0;
  };

  search.addEventListener('input', () => { state.query = search.value; update(); });
  sort.addEventListener('change', () => { state.sort = sort.value; update(); });
  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    state.category = button.dataset.catalogCategory;
    categoryButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    update();
  }));
  root.querySelector('[data-catalog-reset]').addEventListener('click', () => {
    state.query = ''; state.category = 'all'; state.sort = 'popular'; search.value = ''; sort.value = 'popular';
    categoryButtons.forEach((item) => item.classList.toggle('is-active', item.dataset.catalogCategory === 'all'));
    update();
  });
}

export function renderCatalogPage({ products = [], favorites = [], formatPrice }) {
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'));
  setTimeout(() => mountCatalog(products), 0);

  return `<main class="wrap catalog-page" data-catalog-root><div class="crumb">Главная / Каталог</div><h1>Каталог товаров</h1><div class="catalog-toolbar"><label class="catalog-search"><span>⌕</span><input type="search" data-catalog-search placeholder="Поиск по названию товара" autocomplete="off"></label><label class="catalog-sort">Сортировка<select data-catalog-sort><option value="popular">По популярности</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="rating">По рейтингу</option><option value="name">По названию</option></select></label></div><div class="catalog-layout">${renderFilters(categories)}<section class="catalog-results"><p class="catalog-count" data-catalog-count>Найдено товаров: ${products.length}</p><div class="grid catalog-grid" data-catalog-grid>${renderProductGrid(products, favorites, formatPrice)}</div><div class="catalog-empty" data-catalog-empty hidden><span>🔍</span><h2>Ничего не найдено</h2><p>Попробуйте изменить поиск</p></div></section></div></main>`;
}
