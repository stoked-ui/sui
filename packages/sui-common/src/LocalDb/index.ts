/**
 * Exports the LocalDb class, which manages local database operations.
 *
 * @class LocalDb
 */
export default class LocalDb {
  /**
   * Initializes a new instance of the LocalDb class.
   *
   * @constructor
   */
  constructor() {}

  /**
   * Connects to the local database.
   *
   * @async
   * @param {Object} options - Configuration options for the connection.
   * @returns {Promise<void>} A promise that resolves when the connection is established.
   */
  async connect(options) {}

  /**
   * Performs a query on the local database.
   *
   * @async
   * @param {String} sql - The SQL query to execute.
   * @returns {Promise<Array>} A promise that resolves with the query results.
   */
  async query(sql) {}

  /**
   * Inserts a new record into the local database.
   *
   * @async
   * @param {Object} data - The data to be inserted.
   * @returns {Promise<void>} A promise that resolves when the insertion is complete.
   */
  async insert(data) {}

  /**
   * Deletes a record from the local database.
   *
   * @async
   * @param {String} id - The ID of the record to delete.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async delete(id) {}
}

/**
 * Exports all properties and methods of the LocalDb class.
 */
export * from './LocalDb';

/**
 * Exports all properties and methods of the VideoDb class.
 */
export * from './VideoDb';