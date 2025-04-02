/**
 * Represents a simple bank account.
 *
 * This class provides basic functionality for managing deposits and withdrawals,
 * as well as retrieving the current balance.
 */
class BankAccount {
  /**
   * Creates a new bank account.
   *
   * @param {number} [balance=0] - The initial balance in the account (default is 0).
   */
  constructor(balance = 0) {
    this.balance = balance;
  }

  /**
   * Deposits the specified amount into the account.
   *
   * @param {number} amount - The amount to deposit.
   * @throws {Error} If the deposit amount is not positive.
   * @returns {void}
   */
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive.');
    }
    this.balance += amount;
  }

  /**
   * Withdraws the specified amount from the account.
   *
   * @param {number} amount - The amount to withdraw.
   * @throws {Error} If the withdrawal amount is invalid (less than or equal to zero, or greater than the current balance).
   * @returns {void}
   */
  withdraw(amount) {
    if (amount <= 0 || amount > this.balance) {
      throw new Error('Withdrawal amount is invalid.');
    }
    this.balance -= amount;
  }

  /**
   * Gets the current balance in the account.
   *
   * @returns {number} The current balance.
   */
  getBalance() {
    return this.balance;
  }
}