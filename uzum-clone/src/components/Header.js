import '../styles/premium.css';
import '../styles/header.css';
import sportIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320.png';
import kidsIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (1).png';
import fashionIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (2).png';
import saleIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (3).png';
import beautyIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (6).png';
import phoneIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (7).png';
import groceriesIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (8).png';
import homeIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (9).png';

const icon = (name) => ({
  search: '⌕',
  heart: '♡',
  cart: '🛒',
  user: '♙',
  menu: '☰'
}[name]);

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
      renderSuggestions(products, value, true);
      input.focus();
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

<button
  class="scroll-top"
  data-scroll-top
  aria-label="Наверх"
>
  ↑
</button>
`;
}
