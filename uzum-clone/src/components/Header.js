import '../styles/premium.css';
import '../styles/header.css';
import sportIcon from '../assets/categories/gemini-svg (6).svg';
import kidsIcon from '../assets/categories/gemini-svg (5).svg';
import fashionIcon from '../assets/categories/gemini-svg (1).svg';
import saleIcon from '../assets/categories/gemini-svg (3).svg';
import beautyIcon from '../assets/categories/gemini-svg (9).svg';
import phoneIcon from '../assets/categories/gemini-svg.svg';
import groceriesIcon from '../assets/categories/gemini-svg (8).svg';
import homeIcon from '../assets/categories/gemini-svg (4).svg';

const icon = (name) => {
  const svg = (paths, size = 20) =>
    `<svg class="header-icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  const icons = {
    search: svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
    heart: svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>'),
    cart: svg('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
    user: svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    menu: svg('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'),
    home: svg('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  };

  return icons[name];
};

const categoryIcons = {
  'Распродажа': saleIcon,
  'Электроника': phoneIcon,
  'Одежда и обувь': fashionIcon,
  'Красота и здоровье': beautyIcon,
  'Детские товары': kidsIcon,
  'Дом и сад': homeIcon,
  'Продукты питания': groceriesIcon,
  'Спорт и отдых': sportIcon,
};

let scrollEffectsBound = false;
let scrollTopBound = false;
let outsideClickBound = false;
let lastProducts = [];

function prepareImages() {
  document.querySelectorAll('img').forEach((image) => {
    image.loading = 'lazy';

    const reveal = () => {
      image.dataset.imageReady = 'true';
    };

    if (image.complete) {
      reveal();
    } else {
      image.addEventListener('load', reveal, { once: true });
    }
  });
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('ru-RU')} сум`;
}

function findSuggestions(products, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return products
    .filter((product) => product.title && product.title.toLowerCase().includes(needle))
    .slice(0, 5);
}

const HISTORY_KEY = 'uzum-search-history';

function getSearchHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((query) => typeof query === 'string' && query.trim()) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(query) {
  const value = (query || '').trim();
  if (!value) return;

  const history = getSearchHistory().filter((item) => item.toLowerCase() !== value.toLowerCase());
  history.unshift(value);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
}

function clearSearchHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

function renderSearchHistory(dropdown) {
  const history = getSearchHistory();
  if (!history.length) {
    dropdown.hidden = true;
    return;
  }

  dropdown.innerHTML = `
    <div class="search-history">
      <div class="search-history__head">
        <span>Последние поиски</span>
        <button class="search-history__clear" type="button" data-search-history-clear>Очистить</button>
      </div>
      <div class="search-history__list">
        ${history
          .map(
            (query) =>
              `<button class="search-history__item" type="button" data-search-history-query>${query}</button>`
          )
          .join('')}
      </div>
    </div>
  `;
  dropdown.hidden = false;
}

function renderSuggestions(products, query, isFocused) {
  const dropdown = document.querySelector('#search-dropdown');
  if (!dropdown) return;

  if (!query.trim()) {
    if (isFocused) {
      renderSearchHistory(dropdown);
    } else {
      dropdown.hidden = true;
    }
    return;
  }

  const matches = findSuggestions(products, query);

  if (!matches.length) {
    dropdown.innerHTML = '<div class="search-suggestion-empty">Ничего не найдено</div>';
    dropdown.hidden = false;
    return;
  }

  dropdown.innerHTML = matches
    .map(
      (product) => `
        <a
          class="search-suggestion"
          href="#/product/${product.id}"
          data-route="#/product/${product.id}"
        >
          <img src="${product.thumbnail || ''}" alt="${product.title || ''}" loading="lazy">
          <span class="search-suggestion-body">
            <span class="search-suggestion-title">${product.title}</span>
            <span class="search-suggestion-price">${formatPrice(product.price)}</span>
          </span>
        </a>
      `
    )
    .join('');

  dropdown.hidden = false;
}

function bindSearchAutocomplete(products) {
  const input = document.querySelector('#search');
  if (!input) return;

  const update = () => renderSuggestions(products, input.value, document.activeElement === input);

  input.addEventListener('input', update);
  input.addEventListener('focus', update);

  const form = document.querySelector('#search-form');
  if (!form) return;

  form.addEventListener('submit', () => {
    saveSearchHistory(input.value);
  });

  form.addEventListener('click', (event) => {
    const suggestion = event.target.closest('.search-suggestion');
    if (suggestion) {
      const href = suggestion.getAttribute('href');
      if (href) location.hash = href;
      return;
    }

    const historyItem = event.target.closest('[data-search-history-query]');
    if (historyItem) {
      const value = historyItem.textContent.trim();
      input.value = value;
      input.focus();
      form.requestSubmit();
      return;
    }

    const clearButton = event.target.closest('[data-search-history-clear]');
    if (clearButton) {
      clearSearchHistory();
      const dropdown = document.querySelector('#search-dropdown');
      if (dropdown) dropdown.hidden = true;
    }
  });
}

function setupUiEffects(products = []) {
  const updateHeader = () => {
    document
      .querySelector('header')
      ?.classList.toggle('header--compact', window.scrollY > 40);

    document
      .querySelector('[data-scroll-top]')
      ?.classList.toggle('scroll-top--visible', window.scrollY > 400);
  };

  updateHeader();

  if (!scrollEffectsBound) {
    scrollEffectsBound = true;

    window.addEventListener('scroll', updateHeader, {
      passive: true,
    });
  }

  if (!scrollTopBound) {
    scrollTopBound = true;

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-scroll-top]');

      if (!button) return;

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  bindSearchAutocomplete(products);

  if (!outsideClickBound) {
    outsideClickBound = true;

    document.addEventListener('click', (event) => {
      if (event.target.closest('.search')) return;

      const dropdown = document.querySelector('#search-dropdown');
      if (dropdown) dropdown.hidden = true;
    });
  }

  prepareImages();
}

function sessionName() {
  try {
    const session = localStorage.getItem('uzum-session');
    if (!session) return null;
    const users = JSON.parse(localStorage.getItem('uzum-users') || '[]');
    return users.find((user) => user.email === session)?.name || null;
  } catch {
    return null;
  }
}

export function renderHeader(state, cartCount, route = '#/') {
  lastProducts = state.products || [];
  setTimeout(() => setupUiEffects(lastProducts), 0);

  const parsed = route.split('?')[1] || '';
  const params = new URLSearchParams(parsed);
  const path = route.split('?')[0];
  const activeCategory = params.get('category') || null;
  const search = params.get('query');

  const linkCategories = [
    'Распродажа',
    'Электроника',
    'Одежда и обувь',
    'Красота и здоровье',
    'Детские товары',
    'Дом и сад',
    'Продукты питания',
    'Спорт и отдых',
  ];

  const links = [
    { label: 'Главная', param: null, route: '#/', icon: null },
    ...linkCategories.map((label) => ({
      label,
      icon: categoryIcons[label],
      param: label === 'Распродажа' ? 'sale' : label,
      route: `#/catalog?category=${encodeURIComponent(label === 'Распродажа' ? 'sale' : label)}`,
    })),
  ];

  const isActive = (link) => path === link.route.split('?')[0] && (link.param ? link.param === activeCategory : !activeCategory && path === '#/');
  const isMobileNavActive = (target) => path === target;

  const userName = sessionName();
  const accountLabel = userName ? userName.split(' ')[0] : 'Войти';

  return `
<header>

  <div class="notice">
    <div class="wrap">
      Доставим ваш заказ бесплатно от 100 000 сум
      <a data-route="#/catalog?query=пункты выдачи">Пункты выдачи</a>
    </div>
  </div>

  <div class="head wrap">

    <a class="logo" href="#/">
      uzum <b>market</b>
    </a>

    <button class="catalog" data-route="#/catalog">
      ${icon('menu')}
      <span>Каталог</span>
    </button>

    <form class="search" id="search-form">
      <input
        id="search"
        value="${search !== null ? search : state.query}"
        placeholder="Искать товары и категории"
      >
      <button>${icon('search')}</button>
      <div class="search-dropdown" id="search-dropdown" hidden></div>
    </form>

    <nav class="actions"> 
      <button data-route="#/profile" aria-label="${userName ? 'Профиль' : 'Вход или регистрация'}">
        ${icon('user')}
        <small>${accountLabel}</small>
      </button>

      <button data-route="#/favorites">
        ${icon('heart')}
        <small>Избранное</small>
        <i>${state.favorite.length || ''}</i>
      </button>

      <button data-route="#/cart">
        ${icon('cart')}
        <small>Корзина</small>
        <i>${cartCount || ''}</i>
      </button>

    </nav>

  </div>

  <div class="links wrap">
    ${links
      .map(
        (link) =>
          `<a data-category="${link.label}" href="${link.route}" class="${isActive(link) ? 'is-active' : ''}">${
            link.icon ? `<img class="links-icon" src="${link.icon}" alt="">` : ''
          }${link.label}</a>`
      )
      .join('')}
  </div>

</header>

<nav class="mobile-nav" aria-label="Мобильная навигация">
  <a class="mobile-nav__item${isMobileNavActive('#/') ? ' is-active' : ''}" href="#/" data-route="#/">
    <span class="mobile-nav__icon">${icon('home')}</span>
    <small class="mobile-nav__label">Главная</small>
  </a>
  <a class="mobile-nav__item${isMobileNavActive('#/catalog') ? ' is-active' : ''}" href="#/catalog" data-route="#/catalog">
    <span class="mobile-nav__icon">${icon('menu')}</span>
    <small class="mobile-nav__label">Каталог</small>
  </a>
  <a class="mobile-nav__item${isMobileNavActive('#/favorites') ? ' is-active' : ''}" href="#/favorites" data-route="#/favorites">
    <span class="mobile-nav__icon">${icon('heart')}</span>
    <small class="mobile-nav__label">Избранное</small>
    <i class="mobile-nav__badge">${state.favorite.length || ''}</i>
  </a>
  <a class="mobile-nav__item${isMobileNavActive('#/cart') ? ' is-active' : ''}" href="#/cart" data-route="#/cart">
    <span class="mobile-nav__icon">${icon('cart')}</span>
    <small class="mobile-nav__label">Корзина</small>
    <i class="mobile-nav__badge">${cartCount || ''}</i>
  </a>
  <a class="mobile-nav__item${isMobileNavActive('#/profile') ? ' is-active' : ''}" href="#/profile" data-route="#/profile">
    <span class="mobile-nav__icon">${icon('user')}</span>
    <small class="mobile-nav__label">Профиль</small>
  </a>
</nav>

<button
  class="scroll-top"
  data-scroll-top
  aria-label="Наверх"
>
  ↑
</button>
`;
}
