function mountProductGallery() {
  const gallery = document.querySelector('[data-product-gallery]');
  if (!gallery || gallery.dataset.mounted) return;
  gallery.dataset.mounted = 'true';

  const mainImage = gallery.querySelector('[data-product-main-image]');
  gallery.querySelectorAll('[data-product-thumbnail]').forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => {
      const source = thumbnail.dataset.productThumbnail;
      if (!source) return;
      mainImage.classList.add('product-page__main-image--changing');
      setTimeout(() => {
        mainImage.src = source;
        mainImage.classList.remove('product-page__main-image--changing');
      }, 120);
      gallery.querySelectorAll('[data-product-thumbnail]').forEach((item) => item.classList.toggle('product-page__thumbnail--active', item === thumbnail));
    });
  });
}

export function renderProductPage({ product, related, formatPrice }) {
  if (!product) return `<main class="wrap"><h1>Товар не найден</h1></main>`;

  const images = Array(4).fill(product.image);
  setTimeout(mountProductGallery, 0);

  return `<main class="wrap product-page product-page--premium">
    <div class="product-page__top product-page__top--fade-in" data-product-gallery>
      <div class="product-page__thumbnails" aria-label="Фотографии товара">
        ${images.map((image, index) => `<button class="product-page__thumbnail ${index === 0 ? 'product-page__thumbnail--active' : ''}" data-product-thumbnail="${image}" aria-label="Фото ${index + 1}"><img src="${image}" alt="${product.title}" loading="lazy"></button>`).join('')}
      </div>
      <div class="product-page__image"><img class="product-page__main-image" data-product-main-image src="${product.image}" alt="${product.title}" loading="lazy"></div>
      <section class="product-page__info">
        <div class="product-page__meta"><span>${product.brand || 'Бренд'}</span><span>Артикул: ${product.id}</span></div>
        <h1 class="product-page__title">${product.title}</h1>
        <div class="product-page__rating">★ ${product.rating} <a href="#reviews">${product.reviews} отзывов</a></div>
        <div class="product-page__pricing"><div class="product-page__price">${formatPrice(product.price)}</div>${product.oldPrice ? `<div class="product-page__price-row"><div class="product-page__old-price">${formatPrice(product.oldPrice)}</div>${product.discount ? `<span class="product-page__discount">−${product.discount}%</span>` : ''}</div>` : ''}</div>
        <div class="product-page__installment"><span>Рассрочка</span><b>от ${formatPrice(product.installment || Math.ceil(product.price / 12))} в месяц</b><small>на 12 месяцев без переплат</small></div>
        <div class="product-page__delivery"><span>🚚</span><div><b>Доставка от 1 дня</b><p>${product.delivery || 'Бесплатная доставка в пункт выдачи'}</p></div></div>
        <div class="product-page__buy"><button class="product-page__buy-now">Купить сейчас</button><button data-add="${product.id}">🛒 В корзину</button><button data-fav="${product.id}">♡ В избранное</button></div>
        <div class="product-page__benefits"><div><span>🛡️</span><p><b>Гарантия качества</b><small>Проверенный продавец</small></p></div><div><span>↩️</span><p><b>Лёгкий возврат</b><small>В течение 10 дней</small></p></div><div><span>💳</span><p><b>Удобная оплата</b><small>Картой или в рассрочку</small></p></div></div>
      </section>
    </div>
    <section class="product-page__section product-page__section--fade-in"><h2>Описание</h2><p>${product.description || 'Описание товара пока отсутствует.'}</p></section>
    <section class="product-page__section product-page__specifications product-page__section--fade-in"><h2>Характеристики</h2><dl><div><dt>Категория</dt><dd>${product.category || 'Не указана'}</dd></div><div><dt>Бренд</dt><dd>${product.brand || 'Не указан'}</dd></div><div><dt>Рейтинг</dt><dd>★ ${product.rating}</dd></div><div><dt>Отзывы</dt><dd>${product.reviews}</dd></div></dl></section>
    <section class="product-page__section product-page__related product-page__section--fade-in"><div class="product-page__section-heading"><h2>Похожие товары</h2><span>Листайте, чтобы посмотреть все →</span></div><div class="related-products">${(related || []).map((item) => `<article class="related-card" data-route="#/product/${item.id}"><img src="${item.image}" alt="${item.title}" loading="lazy"><h3>${item.title}</h3><strong>${formatPrice(item.price)}</strong></article>`).join('')}</div></section>
  </main>`;
}
