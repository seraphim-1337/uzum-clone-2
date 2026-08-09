const discountOf = (product) => {
  const discount = Number(product.discount) || Number(product.discountPercentage);
  if (discount > 0) return discount;
  if (product.oldPrice > product.price) return Math.round((1 - product.price / product.oldPrice) * 100);
  return 0;
};

export function getCatalogFacets(products) {
  return {
    categories: [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    brands: [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(),
  };
}

export function filterCatalogProducts(products, filters) {
  const query = filters.query.trim().toLowerCase();
  const result = products.filter((product) => {
    const text = `${product.title} ${product.brand || ''} ${product.category || ''}`.toLowerCase();
    return (!query || text.includes(query))
      && (!filters.categories.length || filters.categories.includes(product.category))
      && (!filters.brands.length || filters.brands.includes(product.brand))
      && (!filters.discountOnly || discountOf(product) > 0)
      && (!filters.inStockOnly || product.inStock !== false);
  });

  return result.sort((a, b) => {
    if (filters.sort === 'price-asc') return a.price - b.price;
    if (filters.sort === 'price-desc') return b.price - a.price;
    if (filters.sort === 'rating') return Number(b.rating) - Number(a.rating);
    if (filters.sort === 'discount') return discountOf(b) - discountOf(a);
    return (b.reviews || 0) - (a.reviews || 0) || Number(b.rating) - Number(a.rating);
  });
}
