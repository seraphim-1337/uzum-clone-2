import '../../styles/profile.css';

const key = 'uzum-profile';
const usersKey = 'uzum-users';
const sessionKey = 'uzum-session';

const safeParse = (raw, fallback) => { try { return JSON.parse(raw); } catch { return fallback; } };
const loadProfile = () => safeParse(localStorage.getItem(key) || '{}', {});
const loadUsers = () => safeParse(localStorage.getItem(usersKey) || '[]', []);
const saveUsers = (users) => localStorage.setItem(usersKey, JSON.stringify(users));

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
  const displayName = profile.name || user.name || 'Добро пожаловать!';
  const initials = displayName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return `<main class="profile-page wrap"><section class="profile-card"><div class="profile-card__intro"><div class="profile-avatar" aria-hidden="true">${initials}</div><div><span>Личный кабинет</span><h1>${displayName}</h1><p>Укажите данные, чтобы оформлять заказы быстрее.</p></div></div><form class="profile-form" data-profile-form><label>Имя и фамилия<input name="name" required autocomplete="name" value="${profile.name || ''}" placeholder="Ваше имя"></label><label>Телефон<input name="phone" required inputmode="tel" pattern="[0-9+ ()-]{9,}" autocomplete="tel" value="${profile.phone || ''}" placeholder="+998 90 123 45 67"></label><label>Email<input name="email" type="email" autocomplete="email" value="${profile.email || ''}" placeholder="you@example.com"></label><label>Город<input name="city" autocomplete="address-level2" value="${profile.city || ''}" placeholder="Ташкент"></label><button type="submit">Сохранить изменения</button></form></section><aside class="profile-benefits"><h2>Uzum Market</h2><p>Все ваши заказы, избранное и персональные предложения — в одном месте.</p><a href="#/catalog">Перейти в каталог →</a><button class="profile-logout" data-auth-logout>Выйти из аккаунта</button></aside></main>`;
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
