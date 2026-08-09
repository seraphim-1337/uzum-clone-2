import '../../styles/profile.css';

const key = 'uzum-profile';
const loadProfile = () => JSON.parse(localStorage.getItem(key) || '{}');

export function renderProfilePage() {
  const profile = loadProfile();
  const initials = (profile.name || 'Uzum Пользователь').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return `<main class="profile-page wrap"><section class="profile-card"><div class="profile-card__intro"><div class="profile-avatar" aria-hidden="true">${initials}</div><div><span>Личный кабинет</span><h1>${profile.name || 'Добро пожаловать!'}</h1><p>Укажите данные, чтобы оформлять заказы быстрее.</p></div></div><form class="profile-form" data-profile-form><label>Имя и фамилия<input name="name" required autocomplete="name" value="${profile.name || ''}" placeholder="Ваше имя"></label><label>Телефон<input name="phone" required inputmode="tel" pattern="[0-9+ ()-]{9,}" autocomplete="tel" value="${profile.phone || ''}" placeholder="+998 90 123 45 67"></label><label>Email<input name="email" type="email" autocomplete="email" value="${profile.email || ''}" placeholder="you@example.com"></label><label>Город<input name="city" autocomplete="address-level2" value="${profile.city || ''}" placeholder="Ташкент"></label><button type="submit">Сохранить изменения</button></form></section><aside class="profile-benefits"><h2>Uzum Market</h2><p>Все ваши заказы, избранное и персональные предложения — в одном месте.</p><a href="#/catalog">Перейти в каталог →</a></aside></main>`;
}

export function bindProfilePage(showToast) {
  document.querySelector('[data-profile-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    localStorage.setItem(key, JSON.stringify(data));
    showToast('Данные профиля сохранены');
    document.querySelector('.profile-card__intro h1').textContent = data.name;
    document.querySelector('.profile-avatar').textContent = data.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  });
}
