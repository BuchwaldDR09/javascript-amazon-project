export const cart = [];

export function AddToCart(productId, selectedQty) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += selectedQty;
  } else {
    cart.push({
      productId: productId,
      quantity: selectedQty
    });
  }
}