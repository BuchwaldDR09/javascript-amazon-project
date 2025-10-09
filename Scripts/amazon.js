console.log('javascript connected correctly');

const products = [{
  imageSrc: 'images/products/athletic-cotton-socks-6-pairs.jpg',
  productName: 'Black and Gray Athletic Cotton Socks - 6 Pairs',
  rating: {
    stars: 4.5,
    count: 87
  },
  priceInCents: 1090 //saved as cents for math purposes
}, {
  imageSrc: 'images/products/intermediate-composite-basketball.jpg',
  productName: 'Intermediate Size Basketball',
  rating: {
    stars: 4,
    count: 127
  },
  priceInCents: 2095 //saved as cents for math purposes
}, {
  imageSrc: 'images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg',
  productName: 'Adults Plain Cotton T-Shirt - 2 Pack',
  rating: {
    stars: 4.5,
    count: 56
  },
  priceInCents: 799 //saved as cents for math purposes
}, {
  imageSrc: 'images/products/black-2-slot-toaster.jpg',
  productName: '2 Slot Toaster - Black',
  rating: {
    stars: 5,
    count: 2197
  },
  priceInCents: 1899 //saved as cents for math purposes
}, {
  imageSrc: 'images/products/6-piece-white-dinner-plate-set.jpg',
  productName: '6-Piece White Dinner Plate Set',
  rating: {
    stars: 4,
    count: 37
  },
  priceInCents: 2067 //saved as cents for math purposes
}, {
  imageSrc: 'images/products/6-piece-non-stick-baking-set.webp',
  productName: '6-Piece Nonstick, Carbon Steel Oven Bakeware Set',
  rating: {
    stars: 4.5,
    count: 175
  },
  priceInCents: 3499 //saved as cents for math purposes
}
];

let productsHTML = '';

products.forEach((products) => {
  productsHTML += `
  <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${products.imageSrc}">
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
          $${(products.priceInCents / 100).toFixed(2)}
        </div>

        <div class="product-quantity-container">
          <select>
            <option selected value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart">
          <img src="images/icons/checkmark.png">
          Added
        </div>

        <button class="add-to-cart-button button-primary">
          Add to Cart
        </button>
      </div>
  `;
});

console.log(productsHTML);

document.querySelector('.js-products-grid').innerHTML = productsHTML;

