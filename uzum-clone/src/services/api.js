const API = "/api";

export async function getProducts() {
  const res = await fetch(`${API}/products`);
  return await res.json();
}

export async function getCategories() {
  const res = await fetch(`${API}/categories`);
  return await res.json();
}