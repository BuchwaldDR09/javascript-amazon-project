/* =============================================================
   PAYMENT SUMMARY MODULE (Right Column)
   -------------------------------------------------------------
   Purpose:
   This script calculates and displays all the order totals on the
   checkout page — including:
     • Subtotal (sum of all products × quantity)
     • Shipping (based on selected delivery option)
     • Tax (percentage of subtotal)
     • Final total (subtotal + shipping + tax)

   Context:
   - Works together with `cart.js`, `products.js`, and
     `deliveryOptions.js`.
   - Only reads data — it does not modify the cart.
   - Values are stored and calculated in *cents* to avoid
     floating-point rounding errors.
   ============================================================= */

// -------------------------------------------------------------
// Imports: core data and helper functions
// -------------------------------------------------------------
import { cart } from '../../data/cart.js';                // Current cart contents (array of items)
import { getProduct } from '../../data/products.js';      // Fetches a product object by ID
import { getDeliveryOption } from '../../data/deliveryOptions.js'; // Fetches delivery option by ID
import { FormatCurrency } from '../util/money.js';        // Converts cents → formatted dollars

// -------------------------------------------------------------
// Configuration
// -------------------------------------------------------------
const TAX_RATE = 0.10; // 10% tax rate

// Short utility for selecting DOM elements
const $ = (selector) => document.querySelector(selector);

/* =============================================================
   renderPaymentSummary()
   -------------------------------------------------------------
   Main function that:
     1. Loops through the cart to calculate subtotal + shipping
     2. Computes tax and grand total
     3. Updates HTML elements with formatted dollar amounts
   ============================================================= */
export function renderPaymentSummary() {

  // Initialize totals in cents
  let subtotalCents = 0;  // Total cost of all products
  let shippingCents = 0;  // Total shipping cost

  // -----------------------------------------------------------
  // STEP 1: Calculate subtotal and shipping
  // -----------------------------------------------------------
  cart.forEach((cartItem) => {
    // Find the matching product
    const product = getProduct(cartItem.productId);
    if (product) {
      // Add product cost (price × quantity)
      subtotalCents += product.priceCents * cartItem.quantity;
    }

    // Find the matching delivery option
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    if (deliveryOption) {
      // Add this line’s shipping cost
      // (Currently: one charge per cart line, not per quantity)
      shippingCents += deliveryOption.priceCents;

      // If you wanted to charge per item instead, use:
      // shippingCents += deliveryOption.priceCents * cartItem.quantity;
    }
  });

  // -----------------------------------------------------------
  // STEP 2: Calculate tax and totals
  // -----------------------------------------------------------

  // Tax is calculated on the subtotal only (standard practice)
  const taxCents = Math.round(subtotalCents * TAX_RATE);

  // Total before tax = subtotal + shipping
  const beforeTaxCents = subtotalCents + shippingCents;

  // Grand total = before tax + tax
  const grandTotalCents = beforeTaxCents + taxCents;

  // -----------------------------------------------------------
  // STEP 3: Display values in the HTML
  // -----------------------------------------------------------

  // Select HTML elements by their class names
  const subtotalEl = $('.js-payment-summary-total');             // subtotal (items)
  const shippingEl = $('.js-shipping-cost-summary-money');       // shipping
  const beforeTaxEl = $('.js-total-cost-before-tax');             // subtotal + shipping
  const taxEl = $('.js-estimated-tax');                     // tax amount
  const grandTotalEl = $('.js-final-total-price');                 // grand total (final cost)

  // Update each value safely (check for nulls first)
  if (subtotalEl) subtotalEl.textContent = `$${FormatCurrency(subtotalCents)}`;
  if (shippingEl) shippingEl.textContent = `$${FormatCurrency(shippingCents)}`;
  if (beforeTaxEl) beforeTaxEl.textContent = `$${FormatCurrency(beforeTaxCents)}`;
  if (taxEl) taxEl.textContent = `$${FormatCurrency(taxCents)}`;
  if (grandTotalEl) grandTotalEl.textContent = `$${FormatCurrency(grandTotalCents)}`;

  // -----------------------------------------------------------
  // STEP 4: (Optional) Debugging output for development
  // -----------------------------------------------------------
  console.log('Subtotal      : $', FormatCurrency(subtotalCents));
  console.log('Shipping      : $', FormatCurrency(shippingCents));
  console.log('Before Tax    : $', FormatCurrency(beforeTaxCents));
  console.log('Tax (10%)     : $', FormatCurrency(taxCents));
  console.log('Grand Total   : $', FormatCurrency(grandTotalCents));
}

/* =============================================================
   QUICK REFERENCE
   -------------------------------------------------------------
   subtotalCents     → Total of all products in cart
   shippingCents     → Sum of selected delivery options
   taxCents          → subtotalCents × TAX_RATE
   beforeTaxCents    → subtotalCents + shippingCents
   grandTotalCents   → beforeTaxCents + taxCents

   Example:
     2 items × $10.00  → subtotal = $20.00
     Shipping          → $4.99
     Tax (10%)         → $2.00
     Total             → $26.99
   ============================================================= */
