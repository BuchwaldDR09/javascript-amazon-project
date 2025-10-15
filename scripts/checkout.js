// checkout.js
// ======================================================================
// CHECKOUT PAGE
// - Renders cart items
// - Lets you Update quantity (inline input → Save)
// - Lets you Delete line items
// - Lets you choose a Delivery Option per item (persists selection)
// - Keeps header badges in sync (Items (#), Checkout (#))
// ======================================================================

console.log('checkout.js connected');

import { cart, RemoveFromCart, CalculateCartQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import { FormatCurrency } from './util/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions } from '../data/deliveryOptions.js';

/* ======================================================================
   UTILITIES
   ====================================================================== */

/** Persist the in-memory `cart` into localStorage. */
function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/** Update the “Items (#)” and “Checkout (#)” labels on this page. */
export function GetCartFromStorage() {
  const qty = CalculateCartQuantity();

  const itemsEl = document.querySelector('.js-payment-summary-numOfItems');
  const headerEl = document.querySelector('.js-number-of-cart-items');

  if (itemsEl) itemsEl.innerHTML = `Items (${qty}):`;
  if (headerEl) headerEl.innerHTML = `Checkout (<a class="return-to-home-link" href="amazon.html">${qty}</a>)`;
}

/** Given a deliveryOptionId, return the option object. */
function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find(o => o.id === deliveryOptionId);
}

/** Given a deliveryOptionId, return a human-friendly date string. */
function formatArrivalDate(deliveryOptionId) {
  const opt = getDeliveryOption(deliveryOptionId);
  const days = opt ? opt.deliveryDays : 7;
  return dayjs().add(days, 'days').format('dddd, MMMM D');
}

/* ======================================================================
   RENDER HELPERS
   ====================================================================== */

/**
 * Build the delivery options HTML for one product row.
 * - Preselects the radio whose id === cartItem.deliveryOptionId
 * - Shows date (computed) and price (FREE or formatted)
 */
function deliveryOptionsHTML(productId, selectedDeliveryOptionId) {
  let html = '';

  deliveryOptions.forEach((opt, idx) => {
    const dateText = dayjs().add(opt.deliveryDays, 'days').format('dddd, MMMM D');
    const priceText = opt.priceCents === 0 ? 'FREE' : `${FormatCurrency(opt.priceCents)}`;
    const isChecked = opt.id === selectedDeliveryOptionId ? 'checked' : '';

    html += `
      <div class="delivery-option">
        <input
          type="radio"
          class="delivery-option-input js-delivery-option-input"
          name="delivery-option-${productId}"
          data-product-id="${productId}"
          data-delivery-option-id="${opt.id}"
          ${isChecked}
        >
        <div>
          <div class="delivery-option-date">${dateText}</div>
          <div class="delivery-option-price">${priceText} - Shipping</div>
        </div>
      </div>
    `;
  });

  return html;
}

/* ======================================================================
   RENDER: Build the cart list UI
   ====================================================================== */

function renderCartSummary() {
  // Speed: map product.id → product
  const productById = new Map(products.map(p => [p.id, p]));
  let html = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const product = productById.get(productId);
    if (!product) return; // defensive: unknown id

    // Delivery date line reflects the **current** selection on this row
    const arrivalText = formatArrivalDate(cartItem.deliveryOptionId);

    html += `
      <div class="cart-item-container js-cart-item-container-${product.id}">
        <div class="delivery-date js-row-delivery-date">Delivery date: ${arrivalText}</div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${product.image}" alt="${product.productName}">

          <div class="cart-item-details">
            <div class="product-name">${product.productName}</div>
            <div class="product-price">${FormatCurrency(product.priceCents)}</div>

            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label">${cartItem.quantity}</span>
              </span>

              <!-- Update (visible) -->
              <span
                class="update-quantity-link link-primary js-update-quantity-link"
                data-product-id="${product.id}"
              >Update</span>

              <!-- Inline input (hidden) -->
              <input
                type="number"
                min="1"
                class="js-edit-quantity-input hidden"
                style="width:56px; margin-left:8px;"
              >

              <!-- Save (hidden) -->
              <span
                class="save-quantity-link link-primary js-save-quantity-link hidden"
                data-product-id="${product.id}"
              >Save</span>

              <!-- Delete -->
              <span
                class="delete-quantity-link link-primary js-delete-quantity-link"
                data-product-id="${product.id}"
              >Delete</span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>
            ${deliveryOptionsHTML(productId, cartItem.deliveryOptionId)}
          </div>
        </div>
      </div>
    `;
  });

  const list = document.querySelector('.js-order-summary');
  if (!list) {
    console.warn('Missing .js-order-summary container on this page.');
    return;
  }

  list.innerHTML = html;

  // Keep badges in sync when we re-render.
  GetCartFromStorage();
}

/* ======================================================================
   EVENTS (delegated)
   ====================================================================== */

/** DELETE — remove from data, persist, update badges, remove DOM node */
document.addEventListener('click', (e) => {
  const del = e.target.closest('.js-delete-quantity-link');
  if (!del) return;

  const productId = del.dataset.productId;
  if (!productId) return;

  RemoveFromCart(productId); // persists inside your module
  GetCartFromStorage();

  const container = del.closest('.cart-item-container');
  if (container) container.remove();
});

/** UPDATE/SAVE — toggle edit mode and commit new quantity */
document.addEventListener('click', (e) => {
  // UPDATE clicked → enter edit mode
  const updateLink = e.target.closest('.js-update-quantity-link');
  if (updateLink) {
    const row = updateLink.closest('.product-quantity');
    const deleteL = row.querySelector('.js-delete-quantity-link');
    const saveL = row.querySelector('.js-save-quantity-link');
    const input = row.querySelector('.js-edit-quantity-input');
    const qtyLabel = row.querySelector('.quantity-label');

    input.value = Number(qtyLabel.textContent) || 1;

    updateLink.classList.add('hidden');
    deleteL.classList.add('hidden');
    saveL.classList.remove('hidden');
    input.classList.remove('hidden');

    input.focus();
    input.select();
    input.onkeydown = (ev) => { if (ev.key === 'Enter') saveL.click(); };
    return;
  }

  // SAVE clicked → persist quantity and exit edit mode
  const saveLink = e.target.closest('.js-save-quantity-link');
  if (saveLink) {
    const productId = saveLink.dataset.productId;

    const row = saveLink.closest('.product-quantity');
    const updateL = row.querySelector('.js-update-quantity-link');
    const deleteL = row.querySelector('.js-delete-quantity-link');
    const input = row.querySelector('.js-edit-quantity-input');
    const qtyLabel = row.querySelector('.quantity-label');

    // Update in-memory cart
    const newQty = Math.max(1, Number(input.value) || 1);
    const item = cart.find(i => i.productId === productId);
    if (item) item.quantity = newQty;

    // Persist + update header
    persistCart();
    GetCartFromStorage();

    // Reflect in UI
    qtyLabel.textContent = newQty;

    // Exit edit mode
    saveLink.classList.add('hidden');
    input.classList.add('hidden');
    updateL.classList.remove('hidden');
    deleteL.classList.remove('hidden');
  }
});

/** DELIVERY OPTION CHANGE — set deliveryOptionId and refresh date text */
document.addEventListener('change', (e) => {
  const input = e.target.closest('.js-delivery-option-input');
  if (!input) return;

  const productId = input.dataset.productId;
  const deliveryOptionId = input.dataset.deliveryOptionId;

  // Update in-memory cart for that product
  const item = cart.find(i => i.productId === productId);
  if (item) item.deliveryOptionId = deliveryOptionId;

  // Persist the cart
  persistCart();

  // Update the row's delivery date text to match the new selection
  const container = input.closest('.cart-item-container');
  const dateLabelEl = container?.querySelector('.js-row-delivery-date');
  if (dateLabelEl) {
    dateLabelEl.textContent = `Delivery date: ${formatArrivalDate(deliveryOptionId)}`;
  }
});

/* ======================================================================
   BOOTSTRAP
   ====================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderCartSummary();
});
