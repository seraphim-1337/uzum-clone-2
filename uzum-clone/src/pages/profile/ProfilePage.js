import '../../styles/profile.css';

const key = 'uzum-profile';
const usersKey = 'uzum-users';
const sessionKey = 'uzum-session';
const ordersKey = 'uzum-orders';
const lastOrderKey = 'uzum-last-order';

const safeParse = (raw, fallback) => { try { return JSON.parse(raw); } catch { return fallback; } };
const loadProfile = () => safeParse(localStorage.getItem(key) || '{}', {});
const loadUsers = () => safeParse(localStorage.getItem(usersKey) || '[]', []);
const saveUsers = (users) => localStorage.setItem(usersKey, JSON.stringify(users));
const loadOrders = () => safeParse(localStorage.getItem(ordersKey) || '[]', []);

function currentUser() {
  const session = localStorage.getItem(sessionKey);
  if (!session) return null;
  return loadUsers().find((user) => user.email === session) || null;
}

function loginUser(email, password) {
  const user = loadUsers().find((item) => item.email === email);
  if (!user || user.password !== password) return null;
  localStorage.setItem(sessionKey, user.email);
  localStorage.setItem(key, JSON.stringify({ ...loadProfile(), name: user.name, email: user.email }));
  return user;
}

function registerUser(name, email, password) {
  const users = loadUsers();
  if (users.some((item) => item.email === email)) return null;
  const user = { name, email, password };
  saveUsers([...users, user]);
  localStorage.setItem(sessionKey, user.email);
  localStorage.setItem(key, JSON.stringify({ ...loadProfile(), name: user.name, email: user.email }));
  return user;
}

function formatPrice(value) {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value || 0))} сум`;
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

// Переносит последний оформленный заказ (из чек-аута) в постоянную историю заказов.
// Старые заказы не удаляются; дубликаты по номеру не добавляются.
function ingestLastOrder() {
  const last = safeParse(localStorage.getItem(lastOrderKey) || 'null', null);
  if (!last) return loadOrders();

  const orders = loadOrders();
  const exists = orders.some((order) => order.number === last.number);
  const next = exists ? orders : [last, ...orders];
  if (!exists) localStorage.setItem(ordersKey, JSON.stringify(next));
  localStorage.removeItem(lastOrderKey);
  return next;
}

const ORDER_STEPS = ['Оформлен', 'Собирается', 'Передан в доставку', 'Доставлен'];

// Возвращает текущий статус заказа. Старые заказы без поля status
// автоматически считаются на первом этапе («Оформлен»).
function getOrderStatus(order) {
  const status = order && order.status ? String(order.status) : 'Оформлен';
  return ORDER_STEPS.includes(status) ? status : 'Оформлен';
}

function renderOrderStepper(status) {
  const currentIndex = ORDER_STEPS.indexOf(status);

  return `<ol class="order-status__stepper">
    ${ORDER_STEPS.map((step, index) => {
      const state = index < currentIndex ? 'is-done' : index === currentIndex ? 'is-current' : 'is-future';
      return `<li class="order-status__step ${state}">
        <span class="order-status__dot" aria-hidden="true"></span>
        <span class="order-status__label">${step}</span>
      </li>`;
    }).join('')}
  </ol>`;
}

function renderOrders(orders) {
  if (!orders.length) {
    return `<section class="profile-orders">
      <div class="profile-orders__head"><h2>Мои заказы</h2></div>
      <div class="profile-orders__empty">
        <span>📦</span>
        <p>Заказов пока нет</p>
        <a href="#/catalog">Перейти в каталог</a>
      </div>
    </section>`;
  }

  const cards = orders.map((order) => {
    const items = order.items || [];
    const itemsHtml = items.length
      ? `<ul class="profile-order__items">${items.map((item) => `<li class="profile-order__item"><span>${item.title} <em>× ${item.qty}</em></span><b>${formatPrice(item.price * item.qty)}</b></li>`).join('')}</ul>`
      : '<p class="profile-order__items-empty">Состав заказа не сохранён</p>';

    return `<article class="profile-order">
      <div class="profile-order__header">
        <div class="profile-order__id"><b>${order.number}</b><span>${formatDate(order.date)}</span></div>
        <span class="profile-order__status">${getOrderStatus(order)}</span>
      </div>
      ${itemsHtml}
      <div class="profile-order__footer">
        <div class="profile-order__meta">
          <span>Доставка: ${order.deliveryLabel || '—'}</span>
          <span>Оплата: ${order.paymentLabel || '—'}</span>
        </div>
        <div class="profile-order__total">Сумма <b>${formatPrice(order.total)}</b></div>
      </div>
      <div class="profile-order__actions">
        <a class="profile-order__link" href="#/order/${encodeURIComponent(order.number)}" data-route="#/order/${encodeURIComponent(order.number)}">Подробнее</a>
      </div>
    </article>`;
  }).join('');

  return `<section class="profile-orders">
    <div class="profile-orders__head"><h2>Мои заказы</h2><span>${orders.length}</span></div>
    <div class="profile-orders__list">${cards}</div>
  </section>`;
}

function decodeOrderId(value) {
  try {
    return decodeURIComponent(value || '');
  } catch {
    return value || '';
  }
}

function orderDetailItemsHtml(items) {
  if (!items.length) {
    return '<p class="order-detail__empty">Состав заказа не сохранён</p>';
  }

  return `<ul class="order-detail__items">${items
    .map((item) => {
      const image = item.thumbnail || item.image || '';
      const qty = item.qty || 0;
      const price = item.price != null ? item.price : 0;
      const imageHtml = image ? `<img src="${image}" alt="${item.title || ''}" loading="lazy">` : '';
      return `<li class="order-detail__item">
        ${imageHtml}
        <div class="order-detail__item-body">
          <span class="order-detail__item-title">${item.title || 'Товар'}</span>
          <span class="order-detail__item-qty">${qty} шт × <em>${item.price != null ? formatPrice(item.price) : '—'}</em></span>
        </div>
        <b class="order-detail__item-total">${formatPrice(price * qty)}</b>
      </li>`;
    })
    .join('')}</ul>`;
}

export function renderOrderDetailPage(orderId) {
  const orders = ingestLastOrder();
  const target = decodeOrderId(orderId);
  const order = orders.find((item) => String(item.number) === target) || null;

  if (!order) {
    return `<main class="order-detail wrap">
      <a class="order-detail__back" href="#/profile" data-route="#/profile">Вернуться к заказам</a>
      <section class="order-detail__card">
        <p class="order-detail__not-found">Заказ не найден</p>
      </section>
    </main>`;
  }

  const items = order.items || [];
  const deliveryPrice = order.deliveryPrice != null ? order.deliveryPrice : order.deliveryCost;
  const discount = Number(order.discount) > 0 ? order.discount : null;
  const status = getOrderStatus(order);
  const isLastStatus = status === ORDER_STEPS[ORDER_STEPS.length - 1];
  const nextStatusButton = isLastStatus
    ? ''
    : `<button class="order-detail__next-status" type="button" data-order-status-next="${encodeURIComponent(order.number)}">Следующий статус</button>`;

  return `<main class="order-detail wrap">
    <a class="order-detail__back" href="#/profile" data-route="#/profile">Вернуться к заказам</a>
    <section class="order-detail__card">
      <div class="order-detail__header">
        <div class="order-detail__id">
          <b>Заказ № ${order.number}</b>
          <span>${formatDate(order.date)}</span>
        </div>
        <span class="profile-order__status">${status}</span>
      </div>
      ${renderOrderStepper(status)}
      ${nextStatusButton}
      ${orderDetailItemsHtml(items)}
      <div class="order-detail__info">
        <div class="order-detail__row"><span>Способ доставки</span><b>${order.deliveryLabel || '—'}</b></div>
        <div class="order-detail__row"><span>Стоимость доставки</span><b>${deliveryPrice != null ? (Number(deliveryPrice) === 0 ? 'Бесплатно' : formatPrice(deliveryPrice)) : '—'}</b></div>
        <div class="order-detail__row"><span>Способ оплаты</span><b>${order.paymentLabel || '—'}</b></div>
        ${discount != null ? `<div class="order-detail__row order-detail__row--discount"><span>Скидка</span><b>-${formatPrice(discount)}</b></div>` : ''}
      </div>
      <div class="order-detail__total"><span>Итого</span><b>${formatPrice(order.total)}</b></div>
    </section>
  </main>`;
}

function advanceOrderStatus(orderId) {
  const orders = loadOrders();
  const order = orders.find((item) => String(item.number) === decodeOrderId(orderId));
  if (!order) return;

  const next = ORDER_STEPS[ORDER_STEPS.indexOf(getOrderStatus(order)) + 1];
  if (!next) return;

  order.status = next;
  localStorage.setItem(ordersKey, JSON.stringify(orders));
}

function rerender() {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function renderAuthPage() {
  return `<main class="profile-page wrap">
    <section class="profile-card">
      <div class="profile-card__intro">
        <div class="profile-avatar" aria-hidden="true">👤</div>
        <div><span>Личный кабинет</span><h1>Вход или регистрация</h1><p>Войдите, чтобы оформлять заказы быстрее и хранить данные в одном месте.</p></div>
      </div>
      <div class="auth-tabs">
        <button type="button" class="is-active" data-auth-tab="login">Вход</button>
        <button type="button" data-auth-tab="register">Регистрация</button>
      </div>
      <form class="profile-form auth-form" data-auth-form="login">
        <label>Email<input name="email" type="email" required autocomplete="email" placeholder="you@example.com"></label>
        <label>Пароль<input name="password" type="password" required minlength="6" autocomplete="current-password" placeholder="Минимум 6 символов"></label>
        <button type="submit">Войти</button>
      </form>
      <form class="profile-form auth-form" data-auth-form="register" hidden>
        <label>Имя и фамилия<input name="name" required autocomplete="name" placeholder="Ваше имя"></label>
        <label>Email<input name="email" type="email" required autocomplete="email" placeholder="you@example.com"></label>
        <label>Пароль<input name="password" type="password" required minlength="6" autocomplete="new-password" placeholder="Минимум 6 символов"></label>
        <label>Подтверждение пароля<input name="passwordConfirm" type="password" required minlength="6" autocomplete="new-password" placeholder="Повторите пароль"></label>
        <button type="submit">Создать аккаунт</button>
      </form>
    </section>
    <aside class="profile-benefits"><h2>Uzum Market</h2><p>Заказы, избранное и персональные предложения — в одном месте после входа.</p><a href="#/catalog">Перейти в каталог →</a></aside>
  </main>`;
}

export function renderProfilePage() {
  const user = currentUser();
  if (!user) return renderAuthPage();

  const profile = loadProfile();
  const orders = ingestLastOrder();
  const displayName = profile.name || user.name || 'Добро пожаловать!';
  const initials = displayName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return `<main class="profile-page wrap"><section class="profile-card"><div class="profile-card__intro"><div class="profile-avatar" aria-hidden="true">${initials}</div><div><span>Личный кабинет</span><h1>${displayName}</h1><p>Укажите данные, чтобы оформлять заказы быстрее.</p></div></div><form class="profile-form" data-profile-form><label>Имя и фамилия<input name="name" required autocomplete="name" value="${profile.name || ''}" placeholder="Ваше имя"></label><label>Телефон<input name="phone" required inputmode="tel" pattern="[0-9+ ()-]{9,}" autocomplete="tel" value="${profile.phone || ''}" placeholder="+998 90 123 45 67"></label><label>Email<input name="email" type="email" autocomplete="email" value="${profile.email || ''}" placeholder="you@example.com"></label><label>Город<input name="city" autocomplete="address-level2" value="${profile.city || ''}" placeholder="Ташкент"></label><button type="submit">Сохранить изменения</button></form></section><aside class="profile-benefits"><h2>Uzum Market</h2><p>Все ваши заказы, избранное и персональные предложения — в одном месте.</p><a href="#/catalog">Перейти в каталог →</a><button class="profile-logout" data-auth-logout>Выйти из аккаунта</button></aside>${renderOrders(orders)}</main>`;
}

export function bindProfilePage(showToast) {
  document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const formName = tab.dataset.authTab;
      document.querySelectorAll('[data-auth-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
      document.querySelectorAll('[data-auth-form]').forEach((form) => { form.hidden = form.dataset.authForm !== formName; });
    });
  });

  document.querySelector('[data-auth-form="login"]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const user = loginUser(data.email.trim(), data.password);
    if (!user) {
      showToast('Неверный email или пароль');
      return;
    }
    showToast(`С возвращением, ${user.name}!`);
    rerender();
  });

  document.querySelector('[data-auth-form="register"]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (data.password !== data.passwordConfirm) {
      showToast('Пароли не совпадают');
      return;
    }
    const user = registerUser(data.name.trim(), data.email.trim(), data.password);
    if (!user) {
      showToast('Пользователь с таким email уже существует');
      return;
    }
    showToast('Аккаунт создан, добро пожаловать!');
    rerender();
  });

  document.querySelectorAll('[data-order-status-next]').forEach((button) => {
    button.addEventListener('click', () => {
      advanceOrderStatus(button.dataset.orderStatusNext);
      rerender();
    });
  });

  document.querySelector('[data-auth-logout]')?.addEventListener('click', () => {
    localStorage.removeItem(sessionKey);
    showToast('Вы вышли из аккаунта');
    rerender();
  });

  document.querySelector('[data-profile-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    localStorage.setItem(key, JSON.stringify(data));
    const session = localStorage.getItem(sessionKey);
    if (session) {
      saveUsers(loadUsers().map((item) => item.email === session ? { ...item, name: data.name } : item));
    }
    showToast('Данные профиля сохранены');
    document.querySelector('.profile-card__intro h1').textContent = data.name;
    document.querySelector('.profile-avatar').textContent = data.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  });
}
