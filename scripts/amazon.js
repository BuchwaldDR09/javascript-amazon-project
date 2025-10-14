// amazon.js
// =============================================================
// AMAZON (Products) PAGE SCRIPT
// - Renders product grid
// - Handles "Add to Cart" with selected quantity
// - Updates the cart badge in the header
// =============================================================

console.log('amazon.js connected');

import { cart, AddToCart, CalculateCartQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import { FormatCurrency } from './util/money.js';

/* -------------------------------------------------------------
   Render: Build the products grid HTML
   -------------------------------------------------------------
   1) We create <option> tags programmatically so you can change
      the range later without editing HTML manually.
   2) We build one big HTML string (fast) and inject it once.
--------------------------------------------------------------*/

/** Create <option> tags 1..max with "1" pre-selected */
function quantityOptions(max = 10) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += `<option value="${i}" ${i === 1 ? 'selected' : ''}>${i}</option>`;
  }
  return html;
}

let productsHTML = '';

products.forEach((product) => {
  productsHTML += `
    <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}">
      </div>

      <div class="product-name limit-text-to-2-lines">
        ${product.productName}
      </div>

      <div class="product-rating-container">
        <img
          class="product-rating-stars"
          src="images/ratings/rating-${product.rating.stars * 10}.png"
          alt="${product.rating.stars} star rating"
        >
        <div class="product-rating-count link-primary">
          ${product.rating.count}
        </div>
      </div>

      <div class="product-price">
        ${FormatCurrency(product.priceCents)}
      </div>

      <div class="product-quantity-container">
        <select class="js-quantity-selector" data-product-id="${product.id}">
          ${quantityOptions(10)}
        </select>
      </div>

      <div class="product-spacer"></div>

      <div class="added-to-cart">
        <img src="images/icons/checkmark.png" alt="">
        Added
      </div>

      <button
        class="add-to-cart-button js-add-to-cart button-primary"
        data-product-id="${product.id}">
        Add to Cart
      </button>
    </div>
  `;
});

// Inject the grid HTML once.
const gridEl = document.querySelector('.js-products-grid');
if (!gridEl) {
  console.warn('Missing .js-products-grid on this page.');
} else {
  gridEl.innerHTML = productsHTML;
}

/* -------------------------------------------------------------
   Cart badge: show total items in header
   -------------------------------------------------------------
   We compute once on page load and again after each add-to-cart.
--------------------------------------------------------------*/
function updateCartBadge() {
  const qty = CalculateCartQuantity(); // sums quantities in the cart
  const badge = document.querySelector('.js-cart-quantity');
  if (badge) badge.textContent = qty;
}

// Set the badge on initial load (in case items are in localStorage already)
updateCartBadge();

/* -------------------------------------------------------------
   Add to Cart: attach click handlers to the buttons
   -------------------------------------------------------------
   For each "Add to Cart" button:
   - Read its productId from data attributes
   - Read the selected quantity from the sibling <select>
   - Call AddToCart(productId, selectedQty)
   - Refresh the header badge
--------------------------------------------------------------*/
document.querySelectorAll('.js-add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.productId;

    // Find the closest product card to read its quantity <select>
    const container = button.closest('.product-container');
    const qtySelect = container?.querySelector('.js-quantity-selector');

    // Ensure we have a valid number; default to 1 if missing.
    const selectedQty = Number(qtySelect?.value ?? 1) || 1;

    // Update cart data (and localStorage inside your cart module)
    AddToCart(productId, selectedQty);

    // Update the header badge
    updateCartBadge();
  });
});

/* -------------------------------------------------------------
   Notes / Study Tips
   -------------------------------------------------------------
   - Keep DOM class names with a "js-" prefix when they're used
     by JavaScript; it helps separate styling vs. behavior.
   - We avoid double "$" before FormatCurrency. If your formatter
     already returns "$12.34", don't put another "$" in front.
   - quantityOptions() demonstrates a simple pattern for building
     small HTML snippets with JS loops—cleaner than hardcoding.
   - updateCartBadge() is a tiny "single responsibility" function:
     easy to call anywhere (on load, after adding items, etc.).
--------------------------------------------------------------*/
