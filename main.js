
import { getProducts, getProduct, getCategories } from "./api.js";

import {
  getCart,
  addToCart,
  changeQuantity,
  removeFromCart,
  getCartCount,
  getCartTotal
} from "./cart.js";

import { getRoute, navigate } from "./router.js";

const app = document.getElementById("app");
const cartCount = document.getElementById("cart-count");

let products = [];
let categories = [];
let searchText = "";
let selectedCategory = "all";
let sortBy = "default";

// Escape API strings before placing them in HTML templates.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(value) {
  return "$" + Number(value).toFixed(2);
}

function updateCartCount() {
  cartCount.textContent = getCartCount();
}

function showError(error) {
  app.innerHTML = `
    <section class="message-panel">
      <h2>Something went wrong</h2>
      <p>${escapeHTML(error.message || "Please try again.")}</p>
      <button class="button" id="retry">Try again</button>
    </section>
  `;

  document.getElementById("retry").addEventListener("click", renderRoute);
}

function productCard(product) {
  return `
    <article class="product-card">
      <a class="product-image" href="#/product/${product.id}">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.title)}"
          loading="lazy"
          decoding="async"
        >
      </a>
      <p class="category">${escapeHTML(product.category)}</p>
      <h3>
        <a href="#/product/${product.id}">
          ${escapeHTML(product.title)}
        </a>
      </h3>
      <p class="price">${money(product.price)}</p>
      <button class="button add-button" data-add="${product.id}">
        Add to cart
      </button>
    </article>
  `;
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">DISCOVER SOMETHING NEW</p>
      <h1>Shopping made <span>simple.</span></h1>
      <p>Explore our catalog and find your next favorite product.</p>
      <a href="#/products" class="button">Explore products →</a>
    </section>

    <section class="section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">OUR COLLECTION</p>
          <h2>Featured products</h2>
        </div>
        <a href="#/products">View all →</a>
      </div>
      <div class="product-grid">
        ${products.slice(0, 4).map(productCard).join("")}
      </div>
    </section>
  `;
}

function renderProducts() {
  const visibleProducts = products.filter(product => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesCategory = selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (sortBy === "low") {
    visibleProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "high") {
    visibleProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    visibleProducts.sort(
      (a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0)
    );
  }

  app.innerHTML = `
    <section class="section">
      <p class="eyebrow">THE COLLECTION</p>
      <h1>All products</h1>

      <div class="toolbar">
        <input id="search" type="search"
          placeholder="Search products..."
          value="${escapeHTML(searchText)}">

        <select id="category" aria-label="Filter category">
          <option value="all">All categories</option>
          ${categories.map(category => `
            <option value="${escapeHTML(category)}"
              ${selectedCategory === category ? "selected" : ""}>
              ${escapeHTML(category)}
            </option>
          `).join("")}
        </select>

        <select id="sort" aria-label="Sort products">
          <option value="default">Featured</option>
          <option value="low" ${sortBy === "low" ? "selected" : ""}>
            Price: low to high
          </option>
          <option value="high" ${sortBy === "high" ? "selected" : ""}>
            Price: high to low
          </option>
          <option value="rating" ${sortBy === "rating" ? "selected" : ""}>
            Top rated
          </option>
        </select>
      </div>

      <p class="muted">${visibleProducts.length} products found</p>

      <div class="product-grid">
        ${visibleProducts.map(productCard).join("")}
      </div>

      ${visibleProducts.length === 0
        ? "<p>No products match your search.</p>"
        : ""}
    </section>
  `;

  document.getElementById("search").addEventListener("input", event => {
    searchText = event.target.value;
    renderProducts();
    const input = document.getElementById("search");
    input.focus();
    input.setSelectionRange(searchText.length, searchText.length);
  });

  document.getElementById("category").addEventListener("change", event => {
    selectedCategory = event.target.value;
    renderProducts();
  });

  document.getElementById("sort").addEventListener("change", event => {
    sortBy = event.target.value;
    renderProducts();
  });
}

async function renderProductDetail(id) {
  const product = await getProduct(id);

  app.innerHTML = `
    <a href="#/products" class="back-link">← Back to products</a>
    <section class="detail-layout">
      <div class="detail-image">
        <img src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.title)}">
      </div>
      <div>
        <p class="eyebrow">${escapeHTML(product.category)}</p>
        <h1>${escapeHTML(product.title)}</h1>
        <p class="rating">
          ★ ${product.rating?.rate ?? "N/A"}
          (${product.rating?.count ?? 0} reviews)
        </p>
        <p class="detail-price">${money(product.price)}</p>
        <p class="description">${escapeHTML(product.description)}</p>
        <button class="button" data-add="${product.id}">
          Add to cart
        </button>
      </div>
    </section>
  `;
}

function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    app.innerHTML = `
      <section class="message-panel">
        <h1>Your cart is empty</h1>
        <p>Discover something you love and add it to your cart.</p>
        <a href="#/products" class="button">Browse products</a>
      </section>
    `;
    return;
  }

  app.innerHTML = `
    <section class="section">
      <h1>Your shopping cart</h1>
      <div class="cart-list">
        ${cart.map(item => `
          <article class="cart-item">
            <img src="${escapeHTML(item.image)}"
              alt="${escapeHTML(item.title)}">
            <div class="cart-info">
              <h3>${escapeHTML(item.title)}</h3>
              <p>${money(item.price)} each</p>
              <div class="quantity">
                <button data-quantity="${item.id}" data-change="-1"
                  aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button data-quantity="${item.id}" data-change="1"
                  aria-label="Increase quantity">+</button>
                <button data-remove="${item.id}" class="remove-button">
                  Remove
                </button>
              </div>
            </div>
            <strong>${money(item.price * item.quantity)}</strong>
          </article>
        `).join("")}
      </div>
      <div class="cart-total">
        <h2>Total: ${money(getCartTotal())}</h2>
        <p class="muted">Demo cart only — no payment is processed.</p>
        <a href="#/products" class="button">Continue shopping</a>
      </div>
    </section>
  `;
}

async function renderRoute() {
  try {
    const route = getRoute();

    if (route.page === "home") {
      renderHome();
    } else if (route.page === "products") {
      renderProducts();
    } else if (route.page === "product") {
      if (!/^\d+$/.test(route.id)) {
        throw new Error("Invalid product ID.");
      }
      await renderProductDetail(route.id);
    } else if (route.page === "cart") {
      renderCart();
    } else {
      app.innerHTML = `
        <section class="message-panel">
          <h1>Page not found</h1>
          <a href="#/" class="button">Go home</a>
        </section>
      `;
    }
  } catch (error) {
    showError(error);
  }
}

// Shared click handler for dynamically rendered buttons.
app.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) {
    const product = products.find(
      item => item.id === Number(addButton.dataset.add)
    );

    if (product) {
      addToCart(product);
      addButton.textContent = "Added ✓";
      setTimeout(() => {
        if (addButton.isConnected) {
          addButton.textContent = "Add to cart";
        }
      }, 1000);
    }
  }

  if (quantityButton) {
    changeQuantity(
      Number(quantityButton.dataset.quantity),
      Number(quantityButton.dataset.change)
    );
    renderCart();
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
    renderCart();
  }
});

window.addEventListener("hashchange", renderRoute);

window.addEventListener("cart-updated", () => {
  updateCartCount();

  if (getRoute().page === "cart") {
    renderCart();
  }
});

async function startApp() {
  try {
    app.innerHTML = '<p class="status">Loading products...</p>';

    const results = await Promise.all([
      getProducts(),
      getCategories()
    ]);

    products = results[0];
    categories = results[1];

    updateCartCount();
    await renderRoute();
  } catch (error) {
    showError(error);
  }
}

startApp();
