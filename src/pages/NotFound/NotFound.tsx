// Import Link from react-router-dom
import { Link } from 'react-router-dom';

// Import the CSS file
import './NotFound.css';

export const NotFound = () => {
    return (
        <div className="not-found">
            <h1>
                404 - Page Not Found
            </h1>
            <p>
                The page youre looking for doesnt exist.
            </p>
            <Link to="/" className="not-found__link">
                Go back to the homepage
            </Link>
        </div>
    );
};

export default NotFound;