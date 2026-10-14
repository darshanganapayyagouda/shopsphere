
const API_URL = "https://fakestoreapi.com";

export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Unable to load products. Please try again.");
  }

  return response.json();
}

export async function getProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Unable to load this product.");
  }

  return response.json();
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/products/categories`);

  if (!response.ok) {
    throw new Error("Unable to load categories.");
  }

  return response.json();
}
