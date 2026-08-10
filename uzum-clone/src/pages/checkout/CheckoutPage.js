import '../../styles/checkout.css';

const FREE_DELIVERY_THRESHOLD = 300000;
const COURIER_COST = 20000;
const ORDER_KEY = 'uzum-last-order';

function readLastOrder() {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function deliveryMethodLabel(method) {
  return method === 'courier' ? 'Курьерская доставка' : 'Пункт выдачи Uzum';
}

function paymentMethodLabel(method) {
  return method === 'cash' ? 'При получении' : 'Картой онлайн';
}

function deliveryCost(method, subtotal) {
  if (method === 'pickup') return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : COURIER_COST;
}

function deliveryCostLabel(cost, formatPrice) {
  return cost ? formatPrice(cost) : 'Бесплатно';
}

function successHTML(order, formatPrice) {
  return `
  <main class="checkout-page wrap" data-checkout-root>
    <div class="checkout-success">
      <div class="checkout-success__icon">✓</div>
      <h1>Заказ оформлен</h1>
      <p class="checkout-success__number">Номер заказа: <b>${order.number}</b></p>
      <div class="checkout-success__details">
        <div><span>Доставка</span><b>${order.deliveryLabel}</b></div>
        <div><span>Оплата</span><b>${order.paymentLabel}</b></div>
        <div><span>Сумма</span><b>${formatPrice(order.total)}</b></div>
      </div>
      <p class="checkout-success__note">Мы свяжемся с вами для подтверждения заказа.</p>
      <div class="checkout-success__actions">
        <a href="#/catalog">Продолжить покупки</a>
      </div>
    </div>
  </main>`;
}

function bindCheckout({ subtotal, originalTotal, formatPrice, items }) {
  const form = document.getElementById('checkout');
  if (!form) return;

  const refreshSummary = () => {
    const delivery = form.querySelector('input[name="delivery"]:checked')?.value || 'pickup';
    const payment = form.querySelector('input[name="payment"]:checked')?.value || 'card';
    const cost = deliveryCost(delivery, subtotal);
    const itemDiscount = Math.max(0, originalTotal - subtotal);

    const discountEl = document.querySelector('.checkout-summary__discount');
    const deliveryEl = document.querySelector('.checkout-summary__delivery');
    const deliveryMethodEl = document.querySelector('[data-summary-delivery]');
    const paymentMethodEl = document.querySelector('[data-summary-payment]');
    const totalEl = document.querySelector('[data-summary-total]');

    if (discountEl) discountEl.textContent = `−${formatPrice(itemDiscount)}`;
    if (deliveryEl) deliveryEl.textContent = deliveryCostLabel(cost, formatPrice);
    if (deliveryMethodEl) deliveryMethodEl.textContent = deliveryMethodLabel(delivery);
    if (paymentMethodEl) paymentMethodEl.textContent = paymentMethodLabel(payment);
    if (totalEl) totalEl.textContent = formatPrice(subtotal + cost);
  };

  form.addEventListener('change', refreshSummary);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = form.elements.namedItem('name');
    const phoneInput = form.elements.namedItem('phone');
    if (!nameInput || !phoneInput || !form.reportValidity()) return;

    const delivery = form.querySelector('input[name="delivery"]:checked')?.value || 'pickup';
    const payment = form.querySelector('input[name="payment"]:checked')?.value || 'card';
    const cost = deliveryCost(delivery, subtotal);
    const order = {
      number: `UZ-${Math.floor(100000 + Math.random() * 900000)}`,
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      delivery,
      payment,
      deliveryLabel: deliveryMethodLabel(delivery),
      paymentLabel: paymentMethodLabel(payment),
      total: subtotal + cost,
      date: new Date().toISOString(),
    };

    const orderProducts = (items || []).map((item) => ({
      title: item.title || 'Товар Uzum Market',
      qty: item.qty,
      price: Number(item.price) || 0,
    }));

    localStorage.setItem(ORDER_KEY, JSON.stringify({ ...order, items: orderProducts }));
    history.replaceState(null, '', '#/checkout');

    const root = document.querySelector('[data-checkout-root]');
    if (root) root.outerHTML = successHTML(order, formatPrice);
  });
}

export function renderCheckoutPage({ items, total, formatPrice }) {
  if (!items.length) {
    const lastOrder = readLastOrder();
    if (lastOrder) return successHTML(lastOrder, formatPrice);

    return `<main class="checkout-page wrap">
      <div class="checkout-page__heading"><span>Оформление заказа</span><h1>Ваш заказ</h1></div>
      <div class="checkout-empty">
        <div class="checkout-empty__icon">🛒</div>
        <h2>Корзина пуста</h2>
        <p>Добавьте товары в корзину, чтобы оформить заказ.</p>
        <button class="checkout-empty__button" data-route="#/catalog">Перейти в каталог</button>
      </div>
    </main>`;
  }

  const subtotal = total;
  const originalTotal = items.reduce(
    (sum, item) => sum + (Number(item.oldPrice) || Number(item.price)) * item.qty,
    0,
  );
  const itemDiscount = Math.max(0, originalTotal - subtotal);

  setTimeout(() => bindCheckout({ subtotal, originalTotal, formatPrice, items }), 0);

  return `<main class="checkout-page wrap" data-checkout-root>
    <div class="checkout-page__heading"><span>Оформление заказа</span><h1>Проверьте детали заказа</h1></div>
    <div class="checkout-page__grid">
      <form id="checkout" class="checkout-form">
        <section>
          <h2>Получатель</h2>
          <div class="checkout-form__fields">
            <label>Имя и фамилия<input required name="name" autocomplete="name" placeholder="Например, Азиз Ахмедов"></label>
            <label>Телефон<input required name="phone" inputmode="tel" pattern="[0-9+ ()-]{9,}" autocomplete="tel" placeholder="+998 90 123 45 67"></label>
          </div>
        </section>
        <section>
          <h2>Доставка</h2>
          <div class="checkout-options">
            <label class="checkout-option"><input required type="radio" name="delivery" value="pickup" checked><span><b>Пункт выдачи Uzum</b><small>Бесплатно · Получите заказ рядом с домом</small></span></label>
            <label class="checkout-option"><input type="radio" name="delivery" value="courier"><span><b>Курьерская доставка</b><small>Бесплатно при заказе от 300 000 сум</small></span></label>
          </div>
          <label class="checkout-form__address">Адрес или пункт выдачи<input required name="address" autocomplete="street-address" placeholder="Город, улица, дом или выберите пункт"></label>
        </section>
        <section>
          <h2>Способ оплаты</h2>
          <div class="checkout-options checkout-options--payment">
            <label class="checkout-option"><input required type="radio" name="payment" value="card" checked><span><b>Картой онлайн</b><small>Uzcard, Humo, Visa</small></span></label>
            <label class="checkout-option"><input type="radio" name="payment" value="cash"><span><b>При получении</b><small>Картой или наличными в пункте выдачи</small></span></label>
          </div>
        </section>
        <button class="checkout-form__submit" type="submit">Оформить заказ</button>
        <p class="checkout-form__note">Нажимая кнопку, вы соглашаетесь с условиями сервиса.</p>
      </form>
      <aside class="checkout-summary">
        <h2>Ваш заказ</h2>
        <div class="checkout-summary__items">
          ${items.map(item => `<div class="checkout-summary__item"><span>${item.title} <em class="checkout-summary__qty">× ${item.qty}</em></span><b>${formatPrice(item.price * item.qty)}</b></div>`).join('')}
        </div>
        <div class="checkout-summary__row"><span>Товары</span><b>${formatPrice(originalTotal)}</b></div>
        <div class="checkout-summary__row"><span>Скидка</span><b class="checkout-summary__discount">−${formatPrice(itemDiscount)}</b></div>
        <div class="checkout-summary__row"><span>Доставка</span><b class="checkout-summary__delivery">Бесплатно</b></div>
        <div class="checkout-summary__row"><span>Способ доставки</span><b data-summary-delivery>Пункт выдачи Uzum</b></div>
        <div class="checkout-summary__row"><span>Способ оплаты</span><b data-summary-payment>Картой онлайн</b></div>
        <div class="checkout-summary__total"><span>Итого</span><strong data-summary-total>${formatPrice(subtotal)}</strong></div>
      </aside>
    </div>
  </main>`;
}
