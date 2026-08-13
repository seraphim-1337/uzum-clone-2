import { renderCard } from '../../components/ProductCard.js';
import '../../styles/catalog.css';

const isDiscounted = (product) => Boolean(product.discount || product.discountPercentage || product.oldPrice);
const isErrorProducts = (products) => products.length > 0 && !products[0].images;
const skeletonCard = () => `<div class="card sk-card"><div class="pic sk-pic"></div><div class="card-body"><i class="sk-line sk-line--title"></i><i class="sk-line sk-line--rate"></i><i class="sk-line sk-line--price"></i><i class="sk-line sk-line--btn"></i></div></div>`;
const skeletonGrid = (count = 8) => Array.from({ length: count }, () => skeletonCard()).join('');
const productsErrorBlock = () => `<div class="products-error" data-products-error><span>⚠️</span><h2>Не удалось загрузить товары</h2><p>Проверьте подключение к интернету и попробуйте ещё раз</p><button type="button" class="products-error__retry" data-retry-products>Повторить</button></div>`;
function mountRetry() {
  const retry = document.querySelector('[data-retry-products]');
  if (retry) retry.addEventListener('click', () => location.reload());
}

export function filterProducts(products, filters) {
  const query = filters.query.trim().toLowerCase();
  const min = Number(filters.minPrice) || 0;
  const max = Number(filters.maxPrice) || 0;
  return products.filter((product) => {
    const haystack = [product.title, product.description, product.category].filter(Boolean).join(' ').toLowerCase();
    const categoryOk =
      filters.category === 'all' ||
      (filters.category === 'sale' ? isDiscounted(product) : product.category === filters.category);
    return (!query || haystack.includes(query))
      && categoryOk
      && (!min || product.price >= min)
      && (!max || product.price <= max);
  });
}

export function sortProducts(products, sort) {
  const reviewsOf = (product) => Array.isArray(product.reviews) ? product.reviews.length : product.reviews || 0;
  return [...products].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating') return Number(b.rating) - Number(a.rating);
    if (sort === 'new') return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || b.id - a.id;
    if (sort === 'name') return a.title.localeCompare(b.title, 'ru');
    return reviewsOf(b) - reviewsOf(a) || Number(b.rating) - Number(a.rating);
  });
}

const SORT_LABELS = {
  popular: 'По популярности',
  'price-asc': 'Сначала дешевле',
  'price-desc': 'Сначала дороже',
  rating: 'По рейтингу',
  name: 'По названию',
};

function describeActiveFilters(state) {
  const chips = [];
  if (state.query) chips.push({ key: 'query', label: `Запрос «${state.query}»` });
  if (state.category !== 'all') {
    chips.push({ key: 'category', label: state.category === 'sale' ? 'Распродажа' : state.category });
  }
  if (state.minPrice || state.maxPrice) {
    const parts = [];
    if (state.minPrice) parts.push(`от ${state.minPrice}`);
    if (state.maxPrice) parts.push(`до ${state.maxPrice}`);
    chips.push({ key: 'price', label: `Цена: ${parts.join(' ')}` });
  }
  if (state.sort !== 'popular') {
    chips.push({ key: 'sort', label: SORT_LABELS[state.sort] || state.sort });
  }
  return chips;
}

function renderActiveFilters(container, state) {
  const chips = describeActiveFilters(state);
  container.innerHTML = '';
  container.hidden = !chips.length;
  if (!chips.length) return;

  const title = document.createElement('span');
  title.className = 'catalog-active__title';
  title.textContent = 'Активные фильтры:';
  container.append(title);

  chips.forEach((chip) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'catalog-active__chip';
    button.dataset.catalogChip = chip.key;
    button.textContent = chip.label;
    const cross = document.createElement('span');
    cross.setAttribute('aria-hidden', 'true');
    cross.textContent = '×';
    button.append(cross);
    container.append(button);
  });

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'catalog-active__reset';
  reset.dataset.catalogActiveReset = '';
  reset.textContent = 'Сбросить';
  container.append(reset);
}

export function renderFilters(categories) {
  const categoryList = ['all', 'sale', ...categories.filter((category) => category !== 'Распродажа')];
  return `<aside class="catalog-filters">
    <div class="catalog-filters__section">
      <div class="catalog-filters__header">
        <b>Категории</b>
        <button type="button" data-catalog-reset>Сбросить</button>
      </div>
      <div class="catalog-categories">
        ${categoryList.map((category) => {
          const label = category === 'all' ? 'Все' : category === 'sale' ? '⚡ Распродажа' : category;
          const value = category === 'all' ? 'all' : category === 'sale' ? 'sale' : category;
          return `<button type="button" class="catalog-category" data-catalog-category="${value}">${label}</button>`;
        }).join('')}
      </div>
    </div>
    <div class="catalog-filters__section">
      <div class="catalog-filters__header"><b>Цена, сум</b></div>
      <div class="catalog-price">
        <div>
          <input data-catalog-min type="number" min="0" placeholder="От">
          <input data-catalog-max type="number" min="0" placeholder="До">
        </div>
      </div>
    </div>
  </aside>`;
}

function renderProductGrid(products, favorites, formatPrice, cart) {
  return products.map((product) => `<div class="catalog-product" data-product-id="${product.id}">${renderCard(product, favorites, formatPrice, cart)}</div>`).join('');
}

function mountCatalog(products, options = {}) {
  const root = document.querySelector('[data-catalog-root]');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  const state = {
    query: options.initialQuery || '',
    category: options.initialCategory || 'all',
    sort: 'popular',
    minPrice: 0,
    maxPrice: 0,
  };
  const search = root.querySelector('[data-catalog-search]');
  const sort = root.querySelector('[data-catalog-sort]');
  const min = root.querySelector('[data-catalog-min]');
  const max = root.querySelector('[data-catalog-max]');
  const counter = root.querySelector('[data-catalog-count]');
  const grid = root.querySelector('[data-catalog-grid]');
  const active = root.querySelector('[data-catalog-active]');
  const categoryButtons = [...root.querySelectorAll('[data-catalog-category]')];
  const cards = [...root.querySelectorAll('.catalog-product')];

  search.value = state.query;
  categoryButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.catalogCategory === state.category));

  const update = () => {
    const visible = sortProducts(filterProducts(products, state), state.sort);
    const visibleIds = new Set(visible.map((product) => product.id));
    cards.forEach((card) => {
      card.hidden = !visibleIds.has(Number(card.dataset.productId));
    });
    visible.forEach((product) => grid.append(cards.find((card) => Number(card.dataset.productId) === product.id)));
    counter.textContent = `Найдено товаров: ${visible.length}`;
    renderActiveFilters(active, state);
    const empty = root.querySelector('[data-catalog-empty]');
    if (!visible.length && !empty) {
      grid.insertAdjacentHTML('afterend', `
        <div class="catalog-empty" data-catalog-empty>
          <span>🔍</span>
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить запрос или сбросить фильтры</p>
          <button type="button" class="catalog-empty__reset" data-catalog-reset-any>Сбросить фильтры</button>
        </div>`);
    }
    if (visible.length && empty) empty.remove();
  };

  search.addEventListener('input', () => { state.query = search.value; update(); });
  sort.addEventListener('change', () => { state.sort = sort.value; update(); });
  [min, max].forEach((input) => input.addEventListener('input', () => {
    const minValue = Number(min.value);
    const maxValue = Number(max.value);
    if (minValue !== 0 && maxValue !== 0 && minValue > maxValue) {
      if (input === min) max.value = min.value;
      else min.value = max.value;
    }
    state.minPrice = Math.min(Number(min.value) || 0, Number(max.value) || Infinity);
    state.maxPrice = Math.max(Number(min.value) || 0, Number(max.value) || 0);
    update();
  }));
  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    state.category = button.dataset.catalogCategory;
    categoryButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    update();
  }));
  root.querySelector('[data-catalog-reset]').addEventListener('click', () => {
    Object.assign(state, { query: '', category: 'all', sort: 'popular', minPrice: 0, maxPrice: 0 });
    search.value = '';
    sort.value = 'popular';
    min.value = '';
    max.value = '';
    categoryButtons.forEach((item) => item.classList.toggle('is-active', item.dataset.catalogCategory === 'all'));
    update();
  });

  active.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-catalog-chip]');
    if (chip) {
      const key = chip.dataset.catalogChip;
      if (key === 'query') { state.query = ''; search.value = ''; }
      else if (key === 'category') {
        state.category = 'all';
        categoryButtons.forEach((item) => item.classList.toggle('is-active', item.dataset.catalogCategory === 'all'));
      }
      else if (key === 'price') { state.minPrice = 0; state.maxPrice = 0; min.value = ''; max.value = ''; }
      else if (key === 'sort') { state.sort = 'popular'; sort.value = 'popular'; }
      update();
      return;
    }
    if (event.target.closest('[data-catalog-active-reset]')) {
      root.querySelector('[data-catalog-reset]').click();
    }
  });

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-catalog-reset-any]')) {
      root.querySelector('[data-catalog-reset]').click();
    }
  });

  update();
}


/* ---- Layout helpers (visual markup only) ---- */
const SORT_OPTIONS = `
  <option value="popular">По популярности</option>
  <option value="price-asc">Сначала дешевле</option>
  <option value="price-desc">Сначала дороже</option>
  <option value="rating">По рейтингу</option>
  <option value="name">По названию</option>
`;
const catalogBreadcrumb = (crumb) => `
  <nav class="crumb catalog-breadcrumb" aria-label="Хлебные крошки">
    <span>Главная</span>
    <i class="catalog-breadcrumb__sep" aria-hidden="true">/</i>
    <b class="catalog-breadcrumb__current">${crumb}</b>
  </nav>`;
const catalogToolbar = () => `
  <div class="catalog-toolbar">
    <label class="catalog-search"><span>⌕</span><input type="search" data-catalog-search placeholder="Поиск по названию товара" autocomplete="off"></label>
  </div>`;
const catalogResultsBar = (countText) => `
  <div class="catalog-results-bar">
    <p class="catalog-count" data-catalog-count>${countText}</p>
    <label class="catalog-sort">Сортировка
      <select data-catalog-sort>${SORT_OPTIONS}</select>
    </label>
  </div>`;

export function renderCatalogPage({ products = [], favorites = [], formatPrice, cart = [], categories = [], initialQuery = '', initialCategory = 'all' }) {
  const pageTitle = initialCategory === 'sale'
    ? 'Распродажа'
    : initialCategory && initialCategory !== 'all'
      ? initialCategory
      : 'Каталог товаров';
  const crumb = initialCategory === 'sale' ? 'Распродажа' : initialCategory && initialCategory !== 'all' ? initialCategory : 'Каталог';

  if (isErrorProducts(products)) {
    setTimeout(() => mountRetry(), 0);
    return `<main class="wrap catalog-page" data-catalog-root>
      ${catalogBreadcrumb(crumb)}
      <h1 class="catalog-title">${pageTitle}</h1>
      <section class="catalog-results">${productsErrorBlock()}</section>
    </main>`;
  }

  if (!products.length) {
    return `<main class="wrap catalog-page" data-catalog-root>
      ${catalogBreadcrumb(crumb)}
      <h1 class="catalog-title">${pageTitle}</h1>
      ${catalogToolbar()}
      <section class="catalog-results">
        ${catalogResultsBar('Загрузка товаров…')}
        <div class="grid catalog-grid catalog-grid--loading">${skeletonGrid(8)}</div>
      </section>
    </main>`;
  }

  const categoryList = categories.length
    ? categories
    : [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'));
  setTimeout(() => mountCatalog(products, { initialQuery, initialCategory }), 0);
  return `<main class="wrap catalog-page" data-catalog-root>
    ${catalogBreadcrumb(crumb)}
    <h1 class="catalog-title">${pageTitle}</h1>
    <div class="catalog-layout">
      ${renderFilters(categoryList)}
      <section class="catalog-results">
        ${catalogToolbar()}
        ${catalogResultsBar(`Найдено товаров: ${products.length}`)}
        <div class="catalog-active" data-catalog-active hidden></div>
        <div class="grid catalog-grid" data-catalog-grid>${renderProductGrid(products, favorites, formatPrice, cart)}</div>
      </section>
    </div>
  </main>`;
}
