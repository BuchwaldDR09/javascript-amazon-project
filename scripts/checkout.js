// checkout.js
console.log('checkout.js connected');

import { cart, RemoveFromCart, CalculateCartQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import { FormatCurrency } from './util/money.js';

/* ----------------------------------------------------------------
   UTILITIES
------------------------------------------------------------------*/

// Persist the in-memory `cart` back to localStorage.
// (If RemoveFromCart already persists, this is still safe.)
function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update the header count areas on the checkout page
export function GetCartFromStorage() {
  const qty = CalculateCartQuantity();

  const itemsEl = document.querySelector('.js-payment-summary-numOfItems');
  const headerEl = document.querySelector('.js-number-of-cart-items');

  if (itemsEl) itemsEl.innerHTML = `Items (${qty}):`;
  if (headerEl) headerEl.innerHTML = `Checkout (<a class="return-to-home-link" href="amazon.html">${qty}</a>)`;
}

/* ----------------------------------------------------------------
   RENDER: Build the cart list UI
------------------------------------------------------------------*/

function renderCartSummary() {
  let html = '';

  // Faster lookup: create an index of products by id
  const productById = new Map(products.map(p => [p.id, p]));

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const product = productById.get(productId);
    if (!product) return; // unknown product id (defensive)

    html += `
      <div class="cart-item-container js-cart-item-container-${product.id}">
        <div class="delivery-date">Delivery date: Tuesday, June 21</div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${product.image}">

          <div class="cart-item-details">
            <div class="product-name">${product.productName}</div>

            <div class="product-price">
              ${FormatCurrency(product.priceCents)}
            </div>

            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label">${cartItem.quantity}</span>
              </span>

              <!-- Update link (visible by default) -->
              <span class="update-quantity-link link-primary js-update-quantity-link"
                    data-product-id="${product.id}">
                Update
              </span>

              <!-- Inline editor (hidden by default) -->
              <input type="number"
                     min="1"
                     class="js-edit-quantity-input hidden"
                     style="width:56px; margin-left:8px;" />

              <!-- Save link (hidden by default) -->
              <span class="save-quantity-link link-primary js-save-quantity-link hidden"
                    data-product-id="${product.id}">
                Save
              </span>

              <!-- Delete link -->
              <span class="delete-quantity-link link-primary js-delete-quantity-link"
                    data-product-id="${product.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>

            <div class="delivery-option">
              <input type="radio" checked class="delivery-option-input" name="delivery-option-${product.id}">
              <div>
                <div class="delivery-option-date">Tuesday, June 21</div>
                <div class="delivery-option-price">FREE Shipping</div>
              </div>
            </div>

            <div class="delivery-option">
              <input type="radio" class="delivery-option-input" name="delivery-option-${product.id}">
              <div>
                <div class="delivery-option-date">Wednesday, June 15</div>
                <div class="delivery-option-price">$4.99 - Shipping</div>
              </div>
            </div>

            <div class="delivery-option">
              <input type="radio" class="delivery-option-input" name="delivery-option-${product.id}">
              <div>
                <div class="delivery-option-date">Monday, June 13</div>
                <div class="delivery-option-price">$9.99 - Shipping</div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  });

  const list = document.querySelector('.js-order-summary');
  if (!list) {
    console.warn('Missing .js-order-summary container on this page.');
    return;
  }
  list.innerHTML = html;

  // Make sure header count reflects current storage
  GetCartFromStorage();
}

/* ----------------------------------------------------------------
   EVENT HANDLERS (delegated)
   - One listener for Delete
   - One listener for Update/Save toggle
------------------------------------------------------------------*/

// Delete: remove from data, update header, remove DOM node
document.addEventListener('click', (e) => {
  const del = e.target.closest('.js-delete-quantity-link');
  if (!del) return;

  const productId = del.dataset.productId;
  if (!productId) return;

  // 1) Update data/localStorage
  RemoveFromCart(productId);
  // If RemoveFromCart doesn't persist, also:
  // persistCart();

  // 2) Update header counts
  GetCartFromStorage();

  // 3) Remove the DOM node for this cart item
  const container = del.closest(`.cart-item-container`);
  // (we can also use the exact class if you prefer: `.js-cart-item-container-${productId}`)
  if (container) container.remove();
});

// Update/Save toggle and quantity editing
document.addEventListener('click', (e) => {
  // UPDATE clicked → enter edit mode
  const updateLink = e.target.closest('.js-update-quantity-link');
  if (updateLink) {
    const row = updateLink.closest('.product-quantity');
    const deleteL = row.querySelector('.js-delete-quantity-link');
    const saveL = row.querySelector('.js-save-quantity-link');
    const input = row.querySelector('.js-edit-quantity-input');
    const qtyLabel = row.querySelector('.quantity-label');

    // preload the input with current quantity
    input.value = Number(qtyLabel.textContent) || 1;

    // show input + Save, hide Update + Delete
    updateLink.classList.add('hidden');
    deleteL.classList.add('hidden');
    saveL.classList.remove('hidden');
    input.classList.remove('hidden');

    input.focus();
    input.select();

    // allow Enter to save
    input.onkeydown = (ev) => { if (ev.key === 'Enter') saveL.click(); };

    return;
  }

  // SAVE clicked → commit and exit edit mode
  const saveLink = e.target.closest('.js-save-quantity-link');
  if (saveLink) {
    const productId = saveLink.dataset.productId;
    const row = saveLink.closest('.product-quantity');
    const updateL = row.querySelector('.js-update-quantity-link');
    const deleteL = row.querySelector('.js-delete-quantity-link');
    const input = row.querySelector('.js-edit-quantity-input');
    const qtyLabel = row.querySelector('.quantity-label');

    // 1) Update data
    const newQty = Math.max(1, Number(input.value) || 1);
    const item = cart.find(i => i.productId === productId);
    if (item) item.quantity = newQty;

    persistCart();         // save to localStorage
    GetCartFromStorage();  // update header counts

    // 2) Reflect in UI
    qtyLabel.textContent = newQty;

    // 3) Exit edit mode: hide Save/input, show Update/Delete
    saveLink.classList.add('hidden');
    input.classList.add('hidden');
    updateL.classList.remove('hidden');
    deleteL.classList.remove('hidden');
  }
});

/* ----------------------------------------------------------------
   BOOTSTRAP
------------------------------------------------------------------*/

// Optional but helpful: small CSS utility for show/hide
// Add this once in your CSS file instead of here:
// .hidden { display: none !important; }

document.addEventListener('DOMContentLoaded', () => {
  renderCartSummary();
});
