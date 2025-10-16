/* =============================================================
   CHECKOUT MODULE
   -------------------------------------------------------------
   Purpose:
   Handles the entire checkout page — rendering the cart,
   updating quantities, deleting items, choosing delivery
   options, and keeping everything synced with localStorage.

   Relies on:
   - cart.js (cart data and helper functions)
   - products.js (product info)
   - deliveryOptions.js (shipping choices)
   ============================================================= */

console.log('checkout.js connected');

/* -------------------------------------------------------------
   IMPORTS
   ------------------------------------------------------------- */
import {
  cart,
  RemoveFromCart,
  CalculateCartQuantity,
  UpdateDeliveryOption,
  PersistCart
} from '../data/cart.js';

import { products } from '../data/products.js';
import { FormatCurrency } from './util/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions } from '../data/deliveryOptions.js';

/* =============================================================
   1. HEADER SUMMARY UPDATER
   -------------------------------------------------------------
   Updates the small header counters that show:
   - "Items (#)" above the payment summary
   - "Checkout (#)" at the top of the page
   ============================================================= */
export function GetCartFromStorage() {
  const qty = CalculateCartQuantity();

  const itemsEl = document.querySelector('.js-payment-summary-numOfItems');
  const headerEl = document.querySelector('.js-number-of-cart-items');

  if (itemsEl) {
    itemsEl.innerHTML = `Items (${qty}):`;
  }

  if (headerEl) {
    headerEl.innerHTML = `Checkout (<a class="return-to-home-link" href="amazon.html">${qty}</a>)`;
  }
}

/* =============================================================
   2. DELIVERY OPTION HELPERS
   -------------------------------------------------------------
   These small helpers are used to:
   - Find a delivery option by ID
   - Format its estimated arrival date
   ============================================================= */
function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find(o => o.id === deliveryOptionId);
}

function formatArrivalDate(deliveryOptionId) {
  const opt = getDeliveryOption(deliveryOptionId);
  const days = opt ? opt.deliveryDays : 7; // fallback to 7 days
  return dayjs().add(days, 'days').format('dddd, MMMM D');
}

/* =============================================================
   3. RENDER DELIVERY OPTIONS HTML
   -------------------------------------------------------------
   Creates the radio-button list of delivery options
   for each product in the cart.
   ============================================================= */
function deliveryOptionsHTML(productId, selectedDeliveryOptionId) {
  return deliveryOptions.map(opt => {
    const dateText = dayjs().add(opt.deliveryDays, 'days').format('dddd, MMMM D');
    const priceText = opt.priceCents === 0 ? 'FREE' : `${FormatCurrency(opt.priceCents)}`;
    const checked = opt.id === selectedDeliveryOptionId ? 'checked' : '';

    return `
      <div class="delivery-option">
        <input
          type="radio"
          class="delivery-option-input js-delivery-option-input"
          name="delivery-option-${productId}"
          data-product-id="${productId}"
          data-delivery-option-id="${opt.id}"
          ${checked}
        >
        <div>
          <div class="delivery-option-date">${dateText}</div>
          <div class="delivery-option-price">${priceText} - Shipping</div>
        </div>
      </div>
    `;
  }).join('');
}

/* =============================================================
   4. RENDER CART SUMMARY
   -------------------------------------------------------------
   Builds all cart items on the page, including:
   - Image, name, price
   - Quantity and edit controls
   - Delivery options (radio inputs)
   - Delivery date display
   ============================================================= */
function renderCartSummary() {
  // Create a fast lookup table for products by ID
  const productById = new Map(products.map(p => [p.id, p]));
  let html = '';

  cart.forEach(item => {
    const product = productById.get(item.productId);
    if (!product) return; // skip if product not found

    // Compute current arrival date based on deliveryOptionId
    const arrivalText = formatArrivalDate(item.deliveryOptionId);

    html += `
      <div class="cart-item-container js-cart-item-container-${product.id}">
        <div class="delivery-date js-row-delivery-date">
          Delivery date: ${arrivalText}
        </div>

        <div class="cart-item-details-grid">
          <!-- Product image -->
          <img class="product-image" src="${product.image}" alt="${product.productName}">

          <!-- Product details -->
          <div class="cart-item-details">
            <div class="product-name">${product.productName}</div>
            <div class="product-price">${FormatCurrency(product.priceCents)}</div>

            <div class="product-quantity">
              <!-- Quantity label -->
              <span>Quantity: <span class="quantity-label">${item.quantity}</span></span>

              <!-- Update link (default visible) -->
              <span class="update-quantity-link link-primary js-update-quantity-link"
                    data-product-id="${product.id}">Update</span>

              <!-- Quantity input (hidden until "Update" clicked) -->
              <input type="number" min="1"
                     class="js-edit-quantity-input hidden"
                     style="width:56px; margin-left:8px;">

              <!-- Save link (hidden until editing) -->
              <span class="save-quantity-link link-primary js-save-quantity-link hidden"
                    data-product-id="${product.id}">Save</span>

              <!-- Delete link -->
              <span class="delete-quantity-link link-primary js-delete-quantity-link"
                    data-product-id="${product.id}">Delete</span>
            </div>
          </div>

          <!-- Delivery options -->
          <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>
            ${deliveryOptionsHTML(product.id, item.deliveryOptionId)}
          </div>
        </div>
      </div>
    `;
  });

  // Insert built HTML into the DOM
  const list = document.querySelector('.js-order-summary');
  if (!list) {
    console.warn('Missing .js-order-summary container.');
    return;
  }

  list.innerHTML = html;
  GetCartFromStorage(); // update header counts
}

/* =============================================================
   5. EVENT HANDLERS
   -------------------------------------------------------------
   These control interactions for:
   - Deleting items
   - Updating quantities
   - Saving new quantities
   - Changing delivery options
   ============================================================= */

/* ---------------------------
   DELETE ITEM
----------------------------*/
document.addEventListener('click', (e) => {
  const del = e.target.closest('.js-delete-quantity-link');
  if (!del) return;

  const productId = del.dataset.productId;
  RemoveFromCart(productId);     // handled inside cart.js
  GetCartFromStorage();          // update header

  // Remove from DOM
  const container = del.closest('.cart-item-container');
  if (container) container.remove();
});

/* ---------------------------
   UPDATE → ENTER EDIT MODE
----------------------------*/
document.addEventListener('click', (e) => {
  const update = e.target.closest('.js-update-quantity-link');
  if (!update) return;

  const row = update.closest('.product-quantity');
  const del = row.querySelector('.js-delete-quantity-link');
  const save = row.querySelector('.js-save-quantity-link');
  const input = row.querySelector('.js-edit-quantity-input');
  const label = row.querySelector('.quantity-label');

  // Prefill current quantity
  input.value = Number(label.textContent) || 1;

  // Show input + save, hide update + delete
  update.classList.add('hidden');
  del.classList.add('hidden');
  save.classList.remove('hidden');
  input.classList.remove('hidden');

  // Focus for convenience
  input.focus();
  input.select();

  // Allow "Enter" to act as save
  input.onkeydown = (ev) => {
    if (ev.key === 'Enter') save.click();
  };
});

/* ---------------------------
   SAVE → APPLY NEW QUANTITY
----------------------------*/
document.addEventListener('click', (e) => {
  const save = e.target.closest('.js-save-quantity-link');
  if (!save) return;

  const productId = save.dataset.productId;
  const row = save.closest('.product-quantity');
  const update = row.querySelector('.js-update-quantity-link');
  const del = row.querySelector('.js-delete-quantity-link');
  const input = row.querySelector('.js-edit-quantity-input');
  const label = row.querySelector('.quantity-label');

  const newQty = Math.max(1, Number(input.value) || 1);
  const item = cart.find(i => i.productId === productId);

  if (item) {
    item.quantity = newQty;
    PersistCart();        // ✅ centralized persistence from cart.js
    GetCartFromStorage(); // refresh header count
    label.textContent = newQty;
  }

  // Return to view mode
  save.classList.add('hidden');
  input.classList.add('hidden');
  update.classList.remove('hidden');
  del.classList.remove('hidden');
});

/* ---------------------------
   DELIVERY OPTION CHANGE
----------------------------*/
document.addEventListener('change', (e) => {
  const input = e.target.closest('.js-delivery-option-input');
  if (!input) return;

  const productId = input.dataset.productId;
  const deliveryOptionId = input.dataset.deliveryOptionId;

  // ✅ use centralized helper from cart.js
  UpdateDeliveryOption(productId, deliveryOptionId);

  // Update that row's delivery date text
  const container = input.closest('.cart-item-container');
  const dateEl = container?.querySelector('.js-row-delivery-date');
  if (dateEl) {
    dateEl.textContent = `Delivery date: ${formatArrivalDate(deliveryOptionId)}`;
  }
});

/* =============================================================
   6. INITIALIZATION
   -------------------------------------------------------------
   Runs once the DOM is ready — builds the cart display.
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderCartSummary();
});
