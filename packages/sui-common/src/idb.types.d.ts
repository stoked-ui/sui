interface User {
    id: number;
    name: string;
    email: string;
}

/**
 * Represents a user in the system.
 *
 * @typedef {Object} User
 * @property {number} id - The unique identifier of the user.
 * @property {string} name - The name of the user.
 * @property {string} email - The email address of the user.
 */

/**
 * Fetches user data from the server.
 *
 * @param {number} userId - The ID of the user to fetch.
 * @returns {Promise<User>} The user data fetched from the server.
 */
async function fetchUser(userId: number): Promise<User> {
    // Logic to fetch user data from the server
}

/**
 * Displays a greeting message for the user.
 *
 * @param {User} user - The user data to display the greeting for.
 * @returns {void}
 */
function displayGreeting(user: User): void {
    // Logic to display a greeting message for the user
}

/**
 * Updates the user's email address.
 *
 * @param {User} user - The user to update the email address for.
 * @param {string} newEmail - The new email address to set.
 * @returns {User} The user object with the updated email address.
 */
function updateUserEmail(user: User, newEmail: string): User {
    // Logic to update the user's email address
}