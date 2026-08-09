import '../styles/premium.css';
import '../styles/header.css';

const icon = (name) => ({
  search: '⌕',
  heart: '♡',
  cart: '🛒',
  user: '♙',
  menu: '☰'
}[name]);

let scrollEffectsBound = false;
let scrollTopBound = false;

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

function setupUiEffects() {
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

  prepareImages();
}

export function renderHeader(state, cartCount) {
  setTimeout(setupUiEffects, 0);

  return `
<header>

  <div class="notice">
    <div class="wrap">
      Доставим ваш заказ бесплатно от 100 000 сум
      <span>Пункты выдачи</span>
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
        value="${state.query}"
        placeholder="Искать товары и категории"
      >
      <button>${icon('search')}</button>
    </form>

    <nav class="actions">

      <button data-route="#/profile">
        ${icon('user')}
        <small>Войти</small>
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
    ${
      [
        'Распродажа',
        'Электроника',
        'Одежда и обувь',
        'Красота и здоровье',
        'Детские товары',
        'Дом и сад',
        'Продукты питания',
      ]
        .map((item) => `<a data-category="${item}" href="#/catalog">${item}</a>`)
        .join('')
    }
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
