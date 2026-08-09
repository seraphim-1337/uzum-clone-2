export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=500&q=80";

export function safePrice(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function safeRating(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 5 ? number : 0;
}

export function safeInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

export function reviewCount(product) {
  if (!product) return 0;
  if (Array.isArray(product.reviews)) return product.reviews.length;
  return safeInt(product.reviews, 0);
}

export function productImage(product) {
  if (!product) return FALLBACK_IMAGE;
  const image =
    product.thumbnail ||
    (Array.isArray(product.images) && product.images[0]) ||
    product.image;
  return image || FALLBACK_IMAGE;
}
