/* =============================================================
   CART MODULE
   -------------------------------------------------------------
   This module handles all cart-related logic:
   - loading & saving to localStorage
   - adding, removing, and counting items
   ============================================================= */

// Load the cart from localStorage (saved between page visits)
export let cart = JSON.parse(localStorage.getItem('cart'));

/* -------------------------------------------------------------
   Initialize default cart (for testing)
   -------------------------------------------------------------
   If no cart exists yet in localStorage, this gives us
   some starter data so the site always has something to render.
--------------------------------------------------------------*/
if (!cart) {
  cart = [
    { productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6', quantity: 2 },
    { productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d', quantity: 4 }
  ];
  SaveToStorage(); // save these defaults immediately
}

/* =============================================================
   ADD TO CART
   -------------------------------------------------------------
   Adds a product to the cart, or increases its quantity if it
   already exists. Then saves the updated cart to localStorage.
   ============================================================= */
export function AddToCart(productId, selectedQty) {
  // Look for an existing matching item in the cart
  let matchingItem = cart.find((item) => item.productId === productId);

  if (matchingItem) {
    // If found, increase quantity
    matchingItem.quantity += selectedQty;
  } else {
    // If not found, push a new object
    cart.push({ productId, quantity: selectedQty });
  }

  // Persist changes
  SaveToStorage();
}

/* =============================================================
   REMOVE FROM CART
   -------------------------------------------------------------
   Removes a product by its ID.
   Steps:
   1. Create a new array excluding the removed product.
   2. Replace the old cart with the new array.
   3. Save the updated cart.
   ============================================================= */
export function RemoveFromCart(productId) {
  const newCart = cart.filter((item) => item.productId !== productId);
  cart = newCart;
  SaveToStorage();
}

/* =============================================================
   SAVE TO STORAGE (Private Helper)
   -------------------------------------------------------------
   Converts the cart array to a JSON string and saves it in
   localStorage under the key 'cart'.
   ============================================================= */
function SaveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/* =============================================================
   CALCULATE CART QUANTITY
   -------------------------------------------------------------
   Returns the total number of items across all cart entries.
   Ignores invalid or empty quantities.
   ============================================================= */
export function CalculateCartQuantity() {
  let qty = 0;

  cart.forEach((item) => {
    const amount = Number(item.quantity);
    // Skip items with invalid quantities
    if (!isNaN(amount) && amount > 0) {
      qty += amount;
    }
  });

  return qty;
}
