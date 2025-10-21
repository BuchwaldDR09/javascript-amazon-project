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

import { getProduct } from '../../data/products.js';
import { FormatCurrency } from '../util/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';

/* =============================================================
   1) HEADER SUMMARY UPDATER
   - Updates the small "Items (#)" label and the "Checkout (#)"
   ============================================================= */
export function GetCartFromStorage() {
  const qty = CalculateCartQuantity();

  const itemsEl = document.querySelector('.js-payment-summary-label');
  const headerEl = document.querySelector('.js-number-of-cart-items');

  if (itemsEl) itemsEl.textContent = `Items (${qty}):`; // safer than innerHTML
  if (headerEl) headerEl.innerHTML = `Checkout (<a class="return-to-home-link" href="amazon.html">${qty}</a>)`;
}

/* =============================================================
   2) DELIVERY OPTION HELPERS
   ============================================================= */
function formatArrivalDate(deliveryOptionId) {
  const opt = getDeliveryOption(deliveryOptionId);
  const days = opt ? opt.deliveryDays : 7;
  return dayjs().add(days, 'days').format('dddd, MMMM D');
}

/* =============================================================
   3) DELIVERY OPTIONS HTML (per product row)
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
   4) RENDER CART SUMMARY (left column)
   - Builds the product list rows and inserts into .js-order-summary
   ============================================================= */
export function renderCartSummary() {
  // ❌ Remove: this was invalid and unused
  // let totalShippingCost = FormatCurrency(renderPaymentSummary.totalShippingCost);

  let html = '';

  cart.forEach(item => {
    const product = getProduct(item.productId);
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
  // (No need to call renderPaymentSummary() here; do it after actual mutations)
}

/* =============================================================
   5) EVENT HANDLERS
   - Delete item
   - Enter edit mode
   - Save new quantity
   - Change delivery option
   ============================================================= */

// DELETE ITEM → persist + refresh totals
document.addEventListener('click', (e) => {
  const del = e.target.closest('.js-delete-quantity-link');
  if (!del) return;

  const productId = del.dataset.productId;

  RemoveFromCart(productId); // if this doesn't persist internally, keep the PersistCart() next line
  PersistCart();

  // Update header and totals
  GetCartFromStorage();
  renderPaymentSummary();

  // Remove row from DOM
  const container = del.closest('.cart-item-container');
  if (container) container.remove();
});

// UPDATE → ENTER EDIT MODE
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

// SAVE → APPLY NEW QUANTITY → persist + refresh totals
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
    PersistCart();          // write to localStorage
    GetCartFromStorage();   // update header "Items (#)"
    label.textContent = newQty;
    renderPaymentSummary(); // refresh right-side totals
  }

  // Return to view mode
  save.classList.add('hidden');
  input.classList.add('hidden');
  update.classList.remove('hidden');
  del.classList.remove('hidden');
});

// DELIVERY OPTION CHANGE → persist + refresh totals
document.addEventListener('change', (e) => {
  const input = e.target.closest('.js-delivery-option-input');
  if (!input) return;

  const productId = input.dataset.productId;
  const deliveryOptionId = input.dataset.deliveryOptionId;

  // Update in-memory cart & persist
  UpdateDeliveryOption(productId, deliveryOptionId);
  PersistCart();

  // Update the delivery date text on that row (if present)
  const container = input.closest('.cart-item-container');
  const dateEl = container?.querySelector('.js-row-delivery-date');
  if (dateEl) {
    dateEl.textContent = `Delivery date: ${formatArrivalDate(deliveryOptionId)}`;
  }

  // Always refresh header + totals (even if dateEl not found)
  GetCartFromStorage();
  renderPaymentSummary();

  // No need to rebuild the entire left column here
});
