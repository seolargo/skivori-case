// NotFound.tsx
import { Link } from 'react-router-dom';
import './NotFound.css'; // Optional: Add styles for the 404 page

export const NotFound = () => {
    return (
        <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <p>The page youre looking for doesnt exist.</p>
            <Link to="/" className="not-found__link">
                Go back to the homepage
            </Link>
        </div>
    );
};

export default NotFound;