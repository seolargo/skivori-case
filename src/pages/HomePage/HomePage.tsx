import React from 'react';
import { Link } from 'react-router-dom';

// Import CSS styles
import './HomePage.css';

export const Homepage: React.FC = () => {
    return (
        <div className="container">
            <h1>
                Welcome to the Homepage
            </h1>
            <Link to="/games" className="button">
                Go to Games
            </Link>
            <Link to="/slot-machine" className="button">
                Go to Slot Machine
            </Link>
        </div>
    );
};

export default Homepage;