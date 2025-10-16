/* =============================================================
   CART MODULE
   -------------------------------------------------------------
   Purpose:
   This module manages everything related to the shopping cart:
   - Loading and saving to localStorage
   - Adding and removing items
   - Counting total quantity
   - Updating delivery options
   - Persisting all changes automatically
   ============================================================= */

/* -------------------------------------------------------------
   1. LOAD CART FROM LOCAL STORAGE
   -------------------------------------------------------------
   The cart is stored as a JSON string in localStorage under the
   key "cart". Here we parse it back into a JavaScript array.
   If nothing exists yet (first visit), we’ll create a default
   cart for testing and immediately save it.
--------------------------------------------------------------*/
export let cart = JSON.parse(localStorage.getItem('cart'));

if (!cart) {
  // Default items to make sure the site always has content
  cart = [
    {
      productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
      quantity: 2,
      deliveryOptionId: '1'  // standard shipping (7 days)
    },
    {
      productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
      quantity: 1,
      deliveryOptionId: '2'  // express shipping (3 days)
    }
  ];

  // Save defaults immediately so localStorage isn’t empty
  PersistCart();
}

/* =============================================================
   2. PERSIST CART
   -------------------------------------------------------------
   Converts the cart array into a JSON string and saves it in
   localStorage. This ensures the cart survives page reloads
   and browser restarts.
   ============================================================= */
export function PersistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/* =============================================================
   3. ADD TO CART
   -------------------------------------------------------------
   Adds a product to the cart or increases its quantity if it
   already exists.

   Parameters:
   - productId (string): ID of the product being added
   - selectedQty (number): how many to add
   ============================================================= */
export function AddToCart(productId, selectedQty) {
  // Find an existing cart item that matches the product
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    // If found → just increase its quantity
    existingItem.quantity += selectedQty;
  } else {
    // If not found → create a new cart entry
    cart.push({
      productId,
      quantity: selectedQty,
      deliveryOptionId: '1' // default shipping method
    });
  }

  // Save updated cart to localStorage
  PersistCart();
}

/* =============================================================
   4. REMOVE FROM CART
   -------------------------------------------------------------
   Deletes a product from the cart by filtering out any item
   whose productId matches the one passed in.

   Parameter:
   - productId (string): the ID to remove
   ============================================================= */
export function RemoveFromCart(productId) {
  // Keep all items EXCEPT the one being removed
  cart = cart.filter(item => item.productId !== productId);

  // Save the updated cart
  PersistCart();
}

/* =============================================================
   5. CALCULATE TOTAL CART QUANTITY
   -------------------------------------------------------------
   Loops through the cart and sums all item quantities.
   Ignores invalid, empty, or negative values.
   Returns:
   - (number): total quantity across all products
   ============================================================= */
export function CalculateCartQuantity() {
  let total = 0;

  cart.forEach(item => {
    const qty = Number(item.quantity);
    if (!isNaN(qty) && qty > 0) {
      total += qty;
    }
  });

  return total;
}

/* =============================================================
   6. UPDATE DELIVERY OPTION
   -------------------------------------------------------------
   Updates which delivery method is selected for a given product.
   This allows the user to switch shipping speeds in the checkout.

   Parameters:
   - productId (string): which item in the cart to update
   - deliveryOptionId (string): the chosen shipping option (e.g. '1', '2', '3')
   ============================================================= */
export function UpdateDeliveryOption(productId, deliveryOptionId) {
  // Find the matching item in the cart
  const matchingItem = cart.find(item => item.productId === productId);

  if (matchingItem) {
    // Update the delivery option for that item
    matchingItem.deliveryOptionId = deliveryOptionId;

    // Save the change to localStorage
    PersistCart();
  }
}
