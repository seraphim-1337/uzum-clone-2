const FAVORITES_KEY = "uzum_favorites";

export function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(id) {
  const favorites = getFavorites();

  const index = favorites.indexOf(id);

  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }

  saveFavorites(favorites);
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function getFavoritesCount() {
  return getFavorites().length;
}