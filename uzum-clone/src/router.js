import { renderProductPage } from "./pages/product/ProductPage.js";
import { getProducts } from './services/api.js';
import { renderHeader } from './components/Header.js';
import { showToast } from './components/Toast.js';
import { renderHomePage } from './pages/home/HomePage.js';
import { renderCartPage } from './pages/cart/CartPage.js';
import { renderFavoritesPage } from './pages/favorites/FavoritesPage.js';
import { renderCatalogPage } from './pages/catalog/CatalogPage.js';
import { formatPrice } from './utils/formatPrice.js';
import { renderFooter } from './components/Footer.js';
import { renderCheckoutPage } from './pages/checkout/CheckoutPage.js';
import { bindProfilePage, renderProfilePage } from './pages/profile/ProfilePage.js';
import { renderNotFoundPage } from './pages/not-found/NotFoundPage.js';

const fallbackProducts = [
  ['Смартфон Samsung Galaxy A55 8/256GB', 3999000, 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80'],
  ['Беспроводные наушники Apple AirPods Pro', 2599000, 'Apple', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=500&q=80'],
  ['Кроссовки Nike Air Max', 1299000, 'Одежда и обувь', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80'],
  ['Робот-пылесос Xiaomi Robot Vacuum', 2299000, 'Бытовая техника', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=500&q=80'],
  ['Женская сумка через плечо', 319000, 'Одежда и обувь', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80'],
  ['Кофемашина DeLonghi Dedica', 1749000, 'Бытовая техника', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80'],
  ['Умные часы Huawei Watch Fit', 899000, 'Электроника', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80'],
  ['Набор для ухода за лицом', 149000, 'Красота и здоровье', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80'],
].map(([title, price, category, thumbnail], index) => ({ id: index + 1, title, price, category, thumbnail, rating: (4.5 + (index % 5) / 10).toFixed(1), reviews: 120 + index * 83, installment: Math.ceil(price / 12) }));

const safeParse = (raw, fallback) => { try { return JSON.parse(raw); } catch { return fallback; } };
const categories = [['⚡', 'Распродажа'], ['📱', 'Электроника'], ['👗', 'Одежда и обувь'], ['💄', 'Красота и здоровье'], ['🏠', 'Дом и сад'], ['🍼', 'Детские товары'], ['🛒', 'Продукты питания'], ['⚽', 'Спорт и отдых']];
const state = { products: [], cart: safeParse(localStorage.getItem('uzum-cart') || '[]', []), favorite: safeParse(localStorage.getItem('uzum-favorite') || '[]', []), query: '', category: 'Все' };

const cartCount = () => state.cart.reduce((total, item) => total + item.qty, 0);
const persist = () => {
  localStorage.setItem('uzum-cart', JSON.stringify(state.cart));
  localStorage.setItem('uzum-favorite', JSON.stringify(state.favorite));
};
const visibleProducts = () => state.products.filter((product) => {
  if (state.query && !product.title.toLowerCase().includes(state.query.toLowerCase())) return false;
  if (state.category === 'Все') return true;
  if (state.category === 'Распродажа') return Boolean(product.discount || product.oldPrice);
  return product.category === state.category;
});
const go = (route) => { location.hash = route; };

function pageFor(route) {
  const options = { products: visibleProducts(), favorites: state.favorite, formatPrice, categories, category: state.category, cart: state.cart };
  if (route === '#/') return renderHomePage(options);
  if (route === '#/catalog') {
    return renderCatalogPage({
      products: visibleProducts(),
      favorites: state.favorite,
      formatPrice,
      cart: state.cart,
      categories: [...new Set(state.products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru')),
      initialQuery: state.query,
      initialCategory: state.category === 'Все' || state.category === 'Распродажа' ? 'all' : state.category,
    });
  }
if (route.startsWith("#/product/")) {
  const id = Number(route.split("/")[2]);

  const product = state.products.find((p) => p.id === id);

  if (!product) {
    return renderProductPage({ product: null, related: [], formatPrice });
  }

  const related = state.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return renderProductPage({
    product,
    related,
    formatPrice,
  });
}
  if (route === '#/favorites') return renderFavoritesPage({ ...options, products: state.products });
  if (route === '#/cart') {
    const items = state.cart.map((entry) => ({ ...state.products.find((product) => product.id === entry.id), qty: entry.qty })).filter((item) => item.id);
    return renderCartPage({ items, total: items.reduce((sum, item) => sum + item.price * item.qty, 0), cartCount: cartCount(), formatPrice });
  }
  if (route === '#/checkout') {
    const items = state.cart.map((entry) => ({ ...state.products.find((product) => product.id === entry.id), qty: entry.qty })).filter((item) => item.id);
    return renderCheckoutPage({ items, total: items.reduce((sum, item) => sum + item.price * item.qty, 0), formatPrice });
  }
  if (route === '#/profile') return renderProfilePage();
  return renderNotFoundPage();
}

function bindEvents() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.onclick = () => go(button.dataset.route);
  });

  document.querySelectorAll('[data-category]').forEach((button) => {
    button.onclick = () => {
      state.category = button.dataset.category;
      if (location.hash === '#/catalog') {
        render();
      } else {
        go('#/catalog');
      }
    };
  });

  document.querySelector('#search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = document.querySelector('#search').value.trim();
    if (location.hash === '#/catalog') {
      render();
    } else {
      go('#/catalog');
    }
  });

  // Переход на страницу товара
  document.querySelectorAll('[data-product]').forEach((card) => {
    card.onclick = () => {
      go(`#/product/${card.dataset.product}`);
    };
  });

  // Купить сейчас: добавить в корзину и перейти к оформлению
  document.querySelectorAll('[data-buy-now]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();

      const id = Number(button.dataset.buyNow);
      const item = state.cart.find((entry) => entry.id === id);

      if (item) {
        item.qty += 1;
      } else {
        state.cart.push({ id, qty: 1 });
      }

      persist();
      go('#/checkout');
    };
  });

  // Добавить в корзину
  document.querySelectorAll('[data-add]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();

      const id = Number(button.dataset.add);
      const item = state.cart.find((entry) => entry.id === id);

      if (item) {
        item.qty += 1;
      } else {
        state.cart.push({ id, qty: 1 });
      }

      persist();
      render();
      showToast('Товар добавлен в корзину');
    };
  });

  // Избранное
  document.querySelectorAll('[data-fav]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();

      const id = Number(button.dataset.fav);
      const wasFavorite = state.favorite.includes(id);

      state.favorite = wasFavorite
        ? state.favorite.filter((favoriteId) => favoriteId !== id)
        : [...state.favorite, id];

      persist();
      render();
      showToast(wasFavorite ? 'Товар удалён из избранного' : 'Товар добавлен в избранное');
    };
  });

  // Изменение количества
  document.querySelectorAll('[data-qty]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      const [id, delta] = button.dataset.qty.split('|').map(Number);

      const item = state.cart.find((entry) => entry.id === id);

      item.qty += delta;

      if (item.qty < 1) {
        state.cart = state.cart.filter((entry) => entry.id !== id);
      }

      persist();
      render();
    };
  });

  // Удаление товара
  document.querySelectorAll('[data-remove]').forEach((button) => {
    button.onclick = () => {
      state.cart = state.cart.filter(
        (item) => item.id !== Number(button.dataset.remove)
      );

      persist();
      render();
      showToast('Товар удалён из корзины');
    };
  });

  document.querySelector('#checkout')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.cart = [];
    persist();
    go('#/');
    showToast('Заказ успешно оформлен!');
  });

  bindProfilePage(showToast);
}

function render() {
  const route = location.hash.split('?')[0] || '#/';
  document.querySelector('#app').innerHTML = renderHeader(state, cartCount()) + pageFor(route) + renderFooter();
  bindEvents();
}

const PRICE_RATE = 12700;
const CATEGORY_MAP = {
  'beauty': 'Красота и здоровье',
  'fragrances': 'Красота и здоровье',
  'skin-care': 'Красота и здоровье',
  'skincare': 'Красота и здоровье',
  'furniture': 'Дом и сад',
  'home-decoration': 'Дом и сад',
  'kitchen-accessories': 'Дом и сад',
  'lighting': 'Дом и сад',
  'groceries': 'Продукты питания',
  'laptops': 'Электроника',
  'smartphones': 'Электроника',
  'tablets': 'Электроника',
  'mobile-accessories': 'Электроника',
  'mens-watches': 'Электроника',
  'womens-watches': 'Электроника',
  'mens-shirts': 'Одежда и обувь',
  'mens-shoes': 'Одежда и обувь',
  'womens-dresses': 'Одежда и обувь',
  'womens-shoes': 'Одежда и обувь',
  'womens-bags': 'Одежда и обувь',
  'womens-jewellery': 'Одежда и обувь',
  'sunglasses': 'Одежда и обувь',
  'tops': 'Одежда и обувь',
  'sports-accessories': 'Спорт и отдых',
  'motorcycle': 'Спорт и отдых',
  'vehicle': 'Спорт и отдых',
};

function normalizeProduct(product) {
  const category = CATEGORY_MAP[product.category] || product.category;
  const price = Math.round(product.price * PRICE_RATE / 1000) * 1000;
  const discount = Math.round(Number(product.discountPercentage));
  const normalized = { ...product, category, price, installment: product.installment ? Math.round(price / 12) : product.installment };
  if (discount > 0 && !Number(product.discount) && !product.oldPrice) {
    return { ...normalized, discount, oldPrice: Math.round(price / (1 - discount / 100)) };
  }
  return normalized;
}

async function loadProducts() {
  try {
    const products = await getProducts();
    state.products = products.length && !/Р/.test(products[0].title) ? products.map(normalizeProduct) : fallbackProducts;
  } catch {
    state.products = fallbackProducts;
  }
}

export async function router() {
  await loadProducts();
  window.addEventListener('hashchange', render);
  render();
}
