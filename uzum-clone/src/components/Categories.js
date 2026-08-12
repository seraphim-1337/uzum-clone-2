import kidsIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (1).png';
import schoolIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (4).png';
import groceriesIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (8).png';
import homeIcon from '../assets/categories/Gemini_Generated_Image_v320pvv320pvv320 (9).png';

const promoCategories = [
  { label: 'родители и дети', icon: kidsIcon },
  { label: 'бытовая техника', icon: homeIcon },
  { label: 'современный базар', icon: groceriesIcon },
  { label: 'школьный базар', icon: schoolIcon },
];

export function renderPromoChips() {
  return `
    <section class="home-promo-categories" data-home-section>
      ${promoCategories
        .map(
          ({ label, icon }) => `
            <a class="promo-category" href="#/catalog" data-route="#/catalog">
              <img class="promo-category__icon" src="${icon}" alt="">
              <span class="promo-category__label">${label}</span>
            </a>
          `
        )
        .join('')}
    </section>
  `;
}
