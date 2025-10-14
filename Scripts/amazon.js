console.log('javascript connected correctly');
import { cart, AddToCart, CalculateCartQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import { FormatCurrency } from './util/money.js';

let productsHTML = '';

UpdateCartQty();

//dynamically generate dropdown selector values
function QuantityOptions(max = 10) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += `<option value="${i}" ${i === 1 ? 'selected' : ''}>${i}</option>`;
  }
  return html;
}

products.forEach((products) => {
  productsHTML += `
  <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${products.image}">
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${products.productName}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars" src="images/ratings/rating-${products.rating.stars * 10}.png">
          <div class="product-rating-count link-primary">
            ${products.rating.count}
          </div>
        </div>

        <div class="product-price">
          $${FormatCurrency(products.priceCents)}
        </div>

        <div class="product-quantity-container">
          <select class="js-quantity-selector" data-product-id="${products.id}">
          ${QuantityOptions(10)}
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart">
          <img src="images/icons/checkmark.png">
          Added
        </div>

        <button class="add-to-cart-button js-add-to-cart button-primary"
        data-product-id="${products.id}">
          Add to Cart
        </button>
      </div>
  `;
});

document.querySelector('.js-products-grid').innerHTML = productsHTML;

function UpdateCartQty() {
  let qty = CalculateCartQuantity();
  console.log(qty);
  document.querySelector('.js-cart-quantity').innerHTML = qty;
}

document.querySelectorAll('.js-add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.productId;

    //find the closest product card and its matching dropdown.  this
    //located the closest dropdown, to a product, based upon the location within the code itself. (look more into this) 
    const container = button.closest('.product-container');
    const qtySelect = container.querySelector('.js-quantity-selector');
    const selectedQty = Number(qtySelect?.value ?? 1);

    AddToCart(productId, selectedQty);
    UpdateCartQty();

  });
});


//Item Quantity Selector
//let itemQuantity = document.querySelector('.product-quantity');



