import kidsIcon from '../assets/categories/gemini-svg (5).svg';
import schoolIcon from '../assets/categories/gemini-svg (2).svg';
import groceriesIcon from '../assets/categories/gemini-svg (8).svg';
import homeIcon from '../assets/categories/gemini-svg (4).svg';

const promoCategories = [
  { label: 'родители и дети', icon: kidsIcon, category: 'Детские товары' },
  { label: 'бытовая техника', icon: homeIcon, category: 'Дом и сад' },
  { label: 'современный базар', icon: groceriesIcon, category: 'Продукты питания' },
  { label: 'школьный базар', icon: schoolIcon, category: 'Детские товары' },
];

export function renderPromoChips() {
  return `
    <section class="home-promo-categories" data-home-section>
      ${promoCategories
        .map(
          ({ label, icon, category }) => {
            const route = `#/catalog?category=${encodeURIComponent(category)}`;
            return `
              <a class="promo-category" href="${route}" data-route="${route}">
                <img class="promo-category__icon" src="${icon}" alt="">
                <span class="promo-category__label">${label}</span>
              </a>
            `;
          }
        )
        .join('')}
    </section>
  `;
}
