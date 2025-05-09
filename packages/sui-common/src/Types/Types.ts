/**
 * Interface representing a User object.
 */
interface User {
    id: number;
    name: string;
    email: string;
}

/**
 * Function to fetch user data from the server.
 * @param {number} userId - The ID of the user to fetch.
 * @returns {Promise<User>} - A promise that resolves to a User object.
 */
async function fetchUser(userId: number): Promise<User> {
    // Implementation details omitted
}

/**
 * React component that displays user information.
 * @param {User} props.user - The user object to display.
 * @returns {JSX.Element} - The rendered component.
 * @example
 * <UserProfile user={{ id: 1, name: 'John Doe', email: 'john.doe@example.com' }} />
 */
const UserProfile: React.FC<{ user: User }> = ({ user }) => {
    return (
        <div>
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
        </div>
    );
};

export default UserProfile;