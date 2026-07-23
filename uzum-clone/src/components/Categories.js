export function renderCategories(categories) {
  return `
    <section class="category-grid">
      ${categories
        .map(
          ([icon, name]) => `
            <button data-category="${name}">
              <span>${icon}</span>
              ${name}
            </button>
          `
        )
        .join("")}
    </section>
  `;
}
