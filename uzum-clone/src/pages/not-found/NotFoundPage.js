import '../../styles/not-found.css';

export function renderNotFoundPage() {
  return `<main class="not-found wrap"><div class="not-found__card"><div class="not-found__icon">404</div><h1>Страница не найдена</h1><p>Похоже, эта страница была перемещена или её никогда не существовало.</p><div class="not-found__actions"><a href="#/" data-route="#/">Вернуться на главную</a><a href="#/catalog" data-route="#/catalog">Перейти в каталог</a></div></div></main>`;
}
