/* =============================================================
   CHECKOUT MODULE (LEFT)
   Renders cart items & shipping options
   ============================================================= */

console.log('orderSummary.js connected');

/* -------------------------------------------------------------
   IMPORTS
   ------------------------------------------------------------- */
import {
  cart,
  RemoveFromCart,
  CalculateCartQuantity,
  UpdateDeliveryOption,
  PersistCart
} from '../../data/cart.js';

import { getProduct } from '../../data/products.js';   // ✅ only this now
import { FormatCurrency } from '../util/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';

/* =============================================================
   1. HEADER SUMMARY UPDATER
   ============================================================= */
export function GetCartFromStorage() {
  const qty = CalculateCartQuantity();

  const itemsEl = document.querySelector('.js-payment-summary-label');
  const headerEl = document.querySelector('.js-number-of-cart-items');

  if (itemsEl) itemsEl.innerHTML = `Items (${qty}):`;
  if (headerEl) headerEl.innerHTML = `Checkout (<a class="return-to-home-link" href="amazon.html">${qty}</a>)`;
}

/* =============================================================
   2. DELIVERY OPTION HELPERS
   ============================================================= */

function formatArrivalDate(deliveryOptionId) {
  const opt = getDeliveryOption(deliveryOptionId);
  const days = opt ? opt.deliveryDays : 7;
  return dayjs().add(days, 'days').format('dddd, MMMM D');
}

/* =============================================================
   3. RENDER DELIVERY OPTIONS HTML
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
   ============================================================= */
export function renderCartSummary() {
  let totalShippingCost = (FormatCurrency(renderPaymentSummary.totalShippingCost))

  let html = '';

  cart.forEach(item => {
    const product = getProduct(item.productId); // ✅ Map-based helper
    if (!product) return;

    const arrivalText = formatArrivalDate(item.deliveryOptionId);

    html += `
      <div class="cart-item-container js-cart-item-container-${product.id}">
        <div class="delivery-date js-row-delivery-date">
          Delivery date: ${arrivalText}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${product.image}" alt="${product.productName}">

          <div class="cart-item-details">
            <div class="product-name">${product.productName}</div>
            <div class="product-price">${FormatCurrency(product.priceCents)}</div>

            <div class="product-quantity">
              <span>Quantity: <span class="quantity-label">${item.quantity}</span></span>

              <span class="update-quantity-link link-primary js-update-quantity-link"
                    data-product-id="${product.id}">Update</span>

              <input type="number" min="1"
                     class="js-edit-quantity-input hidden"
                     style="width:56px; margin-left:8px;">

              <span class="save-quantity-link link-primary js-save-quantity-link hidden"
                    data-product-id="${product.id}">Save</span>

              <span class="delete-quantity-link link-primary js-delete-quantity-link"
                    data-product-id="${product.id}">Delete</span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>
            ${deliveryOptionsHTML(product.id, item.deliveryOptionId)}
          </div>
        </div>
      </div>
    `;
  });

  const list = document.querySelector('.js-order-summary');
  if (!list) {
    console.warn('Missing .js-order-summary container.');
    return;
  }

  list.innerHTML = html;
  GetCartFromStorage();
}

/* =============================================================
   5. EVENT HANDLERS (delete, update/save qty, change shipping)
   ============================================================= */

// DELETE
document.addEventListener('click', (e) => {
  const del = e.target.closest('.js-delete-quantity-link');
  if (!del) return;

  const productId = del.dataset.productId;
  RemoveFromCart(productId);
  GetCartFromStorage();

  const container = del.closest('.cart-item-container');
  if (container) container.remove();
});

// UPDATE → EDIT MODE
document.addEventListener('click', (e) => {
  const update = e.target.closest('.js-update-quantity-link');
  if (!update) return;

  const row = update.closest('.product-quantity');
  const del = row.querySelector('.js-delete-quantity-link');
  const save = row.querySelector('.js-save-quantity-link');
  const input = row.querySelector('.js-edit-quantity-input');
  const label = row.querySelector('.quantity-label');

  input.value = Number(label.textContent) || 1;

  update.classList.add('hidden');
  del.classList.add('hidden');
  save.classList.remove('hidden');
  input.classList.remove('hidden');

  input.focus();
  input.select();

  input.onkeydown = (ev) => {
    if (ev.key === 'Enter') save.click();
  };
});

// SAVE QTY
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
    PersistCart();
    GetCartFromStorage();
    label.textContent = newQty;
  }

  save.classList.add('hidden');
  input.classList.add('hidden');
  update.classList.remove('hidden');
  del.classList.remove('hidden');
});

// SHIPPING CHANGE
document.addEventListener('change', (e) => {
  const input = e.target.closest('.js-delivery-option-input');
  if (!input) return;

  const productId = input.dataset.productId;
  const deliveryOptionId = input.dataset.deliveryOptionId;

  UpdateDeliveryOption(productId, deliveryOptionId);

  const container = input.closest('.cart-item-container');
  const dateEl = container?.querySelector('.js-row-delivery-date');
  if (dateEl) {
    dateEl.textContent = `Delivery date: ${formatArrivalDate(deliveryOptionId)}`;
    PersistCart();
    GetCartFromStorage();
    renderCartSummary();
    renderPaymentSummary();
  }
});
