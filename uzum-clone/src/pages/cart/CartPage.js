import "../../styles/cart.css";
import { safePrice, reviewCount, productImage } from "../../utils/fallbacks.js";
import emptyCartIcon from "../../assets/empty-cart.svg";

const PROMO_KEY = "uzum-cart-promo";
const PROMO_CODES = { UZUM10: 0.1 };
const FREE_DELIVERY_THRESHOLD = 300000;
const DELIVERY_COST = 20000;

function getPromo() {
  try {
    const stored = localStorage.getItem(PROMO_KEY);
    return stored && PROMO_CODES[stored.toUpperCase()] ? stored : "";
  } catch {
    return "";
  }
}

function calcSummary(subtotal, promoCode) {
  const promoDiscount = promoCode
    ? Math.round(subtotal * PROMO_CODES[promoCode])
    : 0;
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST;
  return {
    promoDiscount,
    delivery,
    total: subtotal - promoDiscount + delivery,
  };
}

function promoBlock(subtotal) {
  const promoCode = getPromo();
  if (promoCode) {
    return `
      <div class="promo-active">
        <span>Промокод <b>${promoCode}</b> применён</span>
        <button type="button" class="promo-clear" data-promo-clear>Убрать</button>
      </div>`;
  }
  return `
    <form class="promo-form" data-promo>
      <input data-promo-input placeholder="Промокод" autocomplete="off">
      <button type="submit">Применить</button>
    </form>
    <p class="promo-hint" data-promo-hint hidden></p>`;
}

function renderSummary(subtotal, originalTotal, formatPrice) {
  const promoCode = getPromo();
  const summary = calcSummary(subtotal, promoCode);
  const itemDiscount = Math.max(0, originalTotal - subtotal);
  const totalDiscount = itemDiscount + summary.promoDiscount;
  const deliveryLabel = summary.delivery
    ? formatPrice(summary.delivery)
    : "Бесплатно";

  return `<aside class="summary">
    <h2>Ваш заказ</h2>
    <div class="summary__row"><span>Товары</span><b>${formatPrice(originalTotal)}</b></div>
    <div class="summary__row"><span>Скидка</span><b class="green" data-summary-discount>−${formatPrice(totalDiscount)}</b></div>
    <div class="summary__row"><span>Доставка</span><b class="green" data-summary-delivery>${deliveryLabel}</b></div>
    <div class="summary__promo" data-promo-wrap>${promoBlock(subtotal)}</div>
    <hr>
    <div class="summary__total"><span>Итого</span><b data-summary-total>${formatPrice(summary.total)}</b></div>
    <button class="checkout" data-route="#/checkout">Оформить заказ</button>
    <small>Нажимая кнопку, вы соглашаетесь с условиями сервиса</small>
  </aside>`;
}

function bindPromo(subtotal, originalTotal, formatPrice) {
  const applyUI = () => {
    const promoCode = getPromo();
    const summary = calcSummary(subtotal, promoCode);
    const itemDiscount = Math.max(0, originalTotal - subtotal);
    const totalDiscount = itemDiscount + summary.promoDiscount;

    const discountEl = document.querySelector("[data-summary-discount]");
    const deliveryEl = document.querySelector("[data-summary-delivery]");
    const totalEl = document.querySelector("[data-summary-total]");
    const promoWrap = document.querySelector("[data-promo-wrap]");

    if (discountEl) discountEl.textContent = `−${formatPrice(totalDiscount)}`;
    if (deliveryEl) {
      deliveryEl.textContent = summary.delivery
        ? formatPrice(summary.delivery)
        : "Бесплатно";
    }
    if (totalEl) totalEl.textContent = formatPrice(summary.total);
    if (promoWrap) promoWrap.innerHTML = promoBlock(subtotal);
    bindPromo(subtotal, originalTotal, formatPrice);
  };

  const form = document.querySelector("[data-promo]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.querySelector("[data-promo-input]");
      const hint = document.querySelector("[data-promo-hint]");
      const code = input.value.trim().toUpperCase();

      if (!code || !PROMO_CODES[code]) {
        hint.textContent = "Неверный промокод";
        hint.hidden = false;
        return;
      }

      localStorage.setItem(PROMO_KEY, code);
      applyUI();
    });
  }

  const clearBtn = document.querySelector("[data-promo-clear]");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(PROMO_KEY);
      applyUI();
    });
  }
}

export function renderCart(items, total, cartCount, formatPrice) {
  const originalTotal = items.reduce(
    (sum, item) => sum + (safePrice(item.oldPrice) || safePrice(item.price)) * item.qty,
    0,
  );
  const subtotal = Math.max(0, total);
  const content = items
    .map((item) => {
      const price = safePrice(item.price);
      const oldPrice = safePrice(item.oldPrice);
      return `
    <article class="cart-item">
      <div class="cart-item__image"><img
  src="${productImage(item)}"
  alt="${item.title || "Товар Uzum Market"}"
  loading="lazy"
/></div>
      <div class="cart-item__details">
        <p class="cart-item__category">${item.category || "Товар Uzum Market"}</p>
        <b class="cart-item__title">${item.title || "Товар Uzum Market"}</b>
        <p class="cart-item__delivery">Доставка: ${item.delivery || "завтра"}</p>
        <button class="cart-item__remove" data-remove="${item.id}">Удалить</button>
      </div>
      <div class="cart-item__actions">
        <div class="quantity"><button aria-label="Уменьшить количество" data-qty="${item.id}|-1">−</button><b>${item.qty}</b><button aria-label="Увеличить количество" data-qty="${item.id}|1">+</button></div>
        <div class="cart-item__prices"><strong>${formatPrice(price * item.qty)}</strong>${oldPrice ? `<span>${formatPrice(oldPrice * item.qty)}</span>` : ""}</div>
      </div>
    </article>`;
    })
    .join("");

  setTimeout(() => bindPromo(subtotal, originalTotal, formatPrice), 0);

  return `<main class="wrap page cart-page"><div class="cart-page__heading"><h1>Корзина</h1><span>${cartCount} товаров</span></div><div class="cart-layout"><section class="cart-list">${content}</section>${renderSummary(subtotal, originalTotal, formatPrice)}</div></main>`;
}

export function renderCartPage({ items, total, cartCount, formatPrice }) {
  if (items.length) return renderCart(items, total, cartCount, formatPrice);
  return `<main class="wrap page cart-page"><div class="cart-page__heading"><h1>Корзина</h1><span>0 товаров</span></div><div class="cart-empty"><div><img class="cart-empty__icon" src="${emptyCartIcon}" alt="" aria-hidden="true"></div><h2>Корзина пока пустая</h2><p>Добавьте товары из каталога</p><button data-route="#/catalog">Перейти в каталог</button></div></main>`;
}
