import '../styles/hero.css';

const slides = [
  ['Большие скидки', 'До 70% на тысячи товаров', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=85'],
  ['Техника для жизни', 'Новые гаджеты с выгодой до 30%', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=85'],
  ['Стиль нового сезона', 'Одежда и обувь для всей семьи', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85'],
  ['Уютный дом', 'Всё для дома с доставкой от 1 дня', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85'],
  ['Красота каждый день', 'Любимые бренды по приятным ценам', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85'],
];
let intervalId;

export function mountHeroSlider() {
  const hero = document.querySelector('[data-hero-slider]');
  if (!hero) return;
  let current = 0;
  let startX = 0;
  const show = (next) => { current = (next + slides.length) % slides.length; hero.querySelectorAll('[data-hero-slide]').forEach((slide, index) => slide.classList.toggle('is-active', index === current)); hero.querySelectorAll('[data-hero-dot]').forEach((dot, index) => dot.classList.toggle('is-active', index === current)); };
  const stop = () => clearInterval(intervalId);
  const play = () => { stop(); intervalId = setInterval(() => show(current + 1), 5000); };
  hero.querySelector('[data-hero-prev]')?.addEventListener('click', () => { show(current - 1); play(); });
  hero.querySelector('[data-hero-next]')?.addEventListener('click', () => { show(current + 1); play(); });
  hero.querySelectorAll('[data-hero-dot]').forEach((dot, index) => dot.addEventListener('click', () => { show(index); play(); }));
  hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', play);
  hero.addEventListener('touchstart', (event) => { startX = event.changedTouches[0].screenX; }, { passive: true });
  hero.addEventListener('touchend', (event) => { const delta = event.changedTouches[0].screenX - startX; if (Math.abs(delta) > 40) { show(current + (delta < 0 ? 1 : -1)); play(); } }, { passive: true });
  play();
}

export function renderHero() {
  return `<section class="market-hero" data-hero-slider>${slides.map(([title, subtitle, image], index) => `<article class="market-hero__slide ${index === 0 ? 'is-active' : ''}" data-hero-slide><img src="${image}" alt="${title}" loading="lazy"><div class="market-hero__shade"></div><div class="market-hero__content"><span>UZUM MARKET</span><h1>${title}</h1><p>${subtitle}</p><button data-route="#/catalog">Смотреть товары <b>→</b></button></div></article>`).join('')}<button class="market-hero__arrow market-hero__arrow--prev" data-hero-prev aria-label="Предыдущий баннер">‹</button><button class="market-hero__arrow market-hero__arrow--next" data-hero-next aria-label="Следующий баннер">›</button><div class="market-hero__dots">${slides.map((_, index) => `<button class="${index === 0 ? 'is-active' : ''}" data-hero-dot aria-label="Баннер ${index + 1}"></button>`).join('')}</div></section>`;
}
