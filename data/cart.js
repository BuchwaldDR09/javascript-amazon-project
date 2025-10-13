export let cart = JSON.parse(localStorage.getItem('cart'));

if (!cart) {
  cart = [{
    productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
    quantity: 2
  }, {
    productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
    quantity: 4
  }];;
}


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
  SaveToStorage();
}

export function RemoveFromCart(productId) {
  //1. Create a new array
  const newCart = [];
  //2. Loop through the cart and Add each product to the new array, except for the one removed
  cart.forEach((cartItem) => {
    if (cartItem.productId != productId) {
      newCart.push(cartItem);
    }
  })
  //3. Replace original cart
  cart = newCart;

  SaveToStorage();
}

//save to localstorage
function SaveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}