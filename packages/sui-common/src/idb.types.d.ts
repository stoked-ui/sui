/**
 * Calculates the sum of two numbers.
 *
 * @param {number} num1 The first number to add.
 * @param {number} num2 The second number to add.
 * @returns {number} The sum of num1 and num2.
 */
function calculateSum(num1, num2) {
  // Perform addition operation
  const result = num1 + num2;

  return result;
}

/**
 * A simple calculator class that provides basic arithmetic operations.
 *
 * @class Calculator
 */
class Calculator {
  /**
   * Initializes the calculator with a value for 'result'.
   *
   * @param {number} result The initial result value. Defaults to 0.
   */
  constructor(result = 0) {
    this.result = result;
  }

  /**
   * Calculates the sum of two numbers using the calculateSum function.
   *
   * @param {number} num1 The first number to add.
   * @param {number} num2 The second number to add.
   * @returns {number} The sum of num1 and num2.
   */
  calculateSum(num1, num2) {
    return calculateSum(num1, num2);
  }

  /**
   * Calculates the difference between two numbers using the subtract function.
   *
   * @param {number} num1 The first number to subtract from.
   * @param {number} num2 The second number to subtract.
   * @returns {number} The difference of num1 and num2.
   */
  subtract(num1, num2) {
    // Perform subtraction operation
    const result = num1 - num2;

    return result;
  }

  /**
   * Updates the calculator's result value by adding 'num' to the current result.
   *
   * @param {number} num The number to add to the result.
   */
  updateResult(num) {
    // Update the result with the new value
    this.result += num;

    return this.result;
  }
}

/**
 * A simple calculator class that provides basic arithmetic operations.
 *
 * @class Calculator
 */
class Calculator {
  /**
   * Initializes the calculator with a value for 'result'.
   *
   * @param {number} result The initial result value. Defaults to 0.
   */
  constructor(result = 0) {
    this.result = result;
  }

  /**
   * Calculates the sum of two numbers using the calculateSum function.
   *
   * @param {number} num1 The first number to add.
   * @param {number} num2 The second number to add.
   * @returns {number} The sum of num1 and num2.
   */
  calculateSum(num1, num2) {
    return this.add(num1, num2);
  }

  /**
   * Calculates the difference between two numbers using the subtract function.
   *
   * @param {number} num1 The first number to subtract from.
   * @param {number} num2 The second number to subtract.
   * @returns {number} The difference of num1 and num2.
   */
  subtract(num1, num2) {
    return this.subtract(num1, num2);
  }

  /**
   * Updates the calculator's result value by adding 'num' to the current result.
   *
   * @param {number} num The number to add to the result.
   */
  updateResult(num) {
    return this.add(this.result, num);
  }

  /**
   * Calculates the sum of two numbers using addition operation
   *
   * @param {number} num1 The first number to add.
   * @param {number} num2 The second number to add.
   * @returns {number} The sum of num1 and num2.
   */
  add(num1, num2) {
    // Perform addition operation
    const result = num1 + num2;

    return result;
  }

  /**
   * Calculates the difference between two numbers using subtraction operation
   *
   * @param {number} num1 The first number to subtract from.
   * @param {number} num2 The second number to subtract.
   * @returns {number} The difference of num1 and num2.
   */
  subtract(num1, num2) {
    // Perform subtraction operation
    const result = num1 - num2;

    return result;
  }
}