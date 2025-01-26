import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="slot-machine-header">
            <h1
                className="slot-machine-header__title"
                onClick={() => navigate('/')}
            >
                🎰 Skivori Case
            </h1>
        </header>
    );
};

export default Header;
