import "../../styles/cart.css";

export function renderCart(items, total, cartCount, formatPrice) {
  const originalTotal = items.reduce(
    (sum, item) => sum + (item.oldPrice || item.price) * item.qty,
    0,
  );
  const discount = Math.max(0, originalTotal - total);
  const content = items
    .map(
      (item) => `
    <article class="cart-item">
      <div class="cart-item__image"><img
  src="${item.thumbnail}"
  alt="${item.title}"
  loading="lazy"
/></div>
      <div class="cart-item__details">
        <p class="cart-item__category">${item.category || "Товар Uzum Market"}</p>
        <b class="cart-item__title">${item.title}</b>
        <p class="cart-item__delivery">Доставка: ${item.delivery || "завтра"}</p>
        <button class="cart-item__remove" data-remove="${item.id}">Удалить</button>
      </div>
      <div class="cart-item__actions">
        <div class="quantity"><button aria-label="Уменьшить количество" data-qty="${item.id}|-1">−</button><b>${item.qty}</b><button aria-label="Увеличить количество" data-qty="${item.id}|1">+</button></div>
        <div class="cart-item__prices"><strong>${formatPrice(item.price * item.qty)}</strong>${item.oldPrice ? `<span>${formatPrice(item.oldPrice * item.qty)}</span>` : ""}</div>
      </div>
    </article>`,
    )
    .join("");

  return `<main class="wrap page cart-page"><div class="cart-page__heading"><h1>Корзина</h1><span>${cartCount} товаров</span></div><div class="cart-layout"><section class="cart-list">${content}</section><aside class="summary"><h2>Ваш заказ</h2><div class="summary__row"><span>Товаров</span><b>${cartCount} шт.</b></div><div class="summary__row"><span>Стоимость товаров</span><b>${formatPrice(originalTotal)}</b></div><div class="summary__row"><span>Скидка</span><b class="green">−${formatPrice(discount)}</b></div><div class="summary__row"><span>Доставка</span><b class="green">Бесплатно</b></div><hr><div class="summary__total"><span>Итого</span><b>${formatPrice(total)}</b></div><button class="checkout" data-route="#/checkout">Оформить заказ</button><small>Нажимая кнопку, вы соглашаетесь с условиями сервиса</small></aside></div></main>`;
}

export function renderCartPage({ items, total, cartCount, formatPrice }) {
  if (items.length) return renderCart(items, total, cartCount, formatPrice);
  return `<main class="wrap page cart-page"><div class="cart-page__heading"><h1>Корзина</h1><span>0 товаров</span></div><div class="cart-empty"><div>🛒</div><h2>Корзина пока пустая</h2><p>Добавьте товары из каталога</p><button data-route="#/catalog">Перейти в каталог</button></div></main>`;
}
