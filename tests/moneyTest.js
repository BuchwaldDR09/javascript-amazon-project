//Examples of testing

/*
Two different types of test cases
1. Basic test cases
  - tests if the code is working

2. Edge test cases
  - test for rare occurrences 
*/

import { FormatCurrency } from "../scripts/util/money.js";

console.log('test suite: formatCurrency');

if (FormatCurrency(2095) === '20.95') {
  console.log('Format Currency Test: passed');
} else {
  console.log('Format Currency Test: failed');
}

if (FormatCurrency(0) === '0.00') {
  console.log('Format Currency 0 Test: passed');
} else {
  console.log('Format Currency 0 Test: failed');
}

if (FormatCurrency(2000.5) === '20.01') {
  console.log('Format Currency rounding up Test: passed');
} else {
  console.log('Format Currency rounding up Test: failed');
}

if (FormatCurrency(2000.4) === '20.00') {
  console.log('Format Currency rounding down Test: passed');
} else {
  console.log('Format Currency rounding down Test: failed');
}

