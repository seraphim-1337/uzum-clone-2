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
  setTimeout(setupUiEffects, 0);

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
    { label: 'Главная', param: null, route: '#/' },
    ...linkCategories.map((label) => ({
      label,
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
          `<a data-category="${link.label}" href="${link.route}" class="${isActive(link) ? 'is-active' : ''}">${link.label}</a>`
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
