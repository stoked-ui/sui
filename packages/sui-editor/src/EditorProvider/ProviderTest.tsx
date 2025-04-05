/**
 * Represents a user in the system.
 */
interface User {
    id: number;
    name: string;
    email: string;
}

/**
 * Represents a product in the system.
 */
interface Product {
    id: number;
    name: string;
    price: number;
}

/**
 * Calculates the total price of a list of products.
 * @param {Product[]} products - The list of products to calculate the total price.
 * @returns {number} The total price of all products.
 */
function calculateTotalPrice(products: Product[]): number {
    let totalPrice = 0;
    products.forEach((product) => {
        totalPrice += product.price;
    });
    return totalPrice;
}

/**
 * Component that displays a list of users.
 * @param {User[]} users - The list of users to display.
 * @returns {JSX.Element} The component to render.
 */
const UserList = ({ users }: { users: User[] }): JSX.Element => {
    return (
        <div>
            <h1>User List</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
};

/**
 * Component that displays a list of products.
 * @param {Product[]} products - The list of products to display.
 * @returns {JSX.Element} The component to render.
 */
const ProductList = ({ products }: { products: Product[] }): JSX.Element => {
    return (
        <div>
            <h1>Product List</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>{product.name} - ${product.price}</li>
                ))}
            </ul>
        </div>
    );
};

export { User, Product, calculateTotalPrice, UserList, ProductList };