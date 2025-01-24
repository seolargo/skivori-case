import './LoadingSpinner.css'; // Optional: Add styles for the spinner

export const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
        </div>
    );
};

export default LoadingSpinner;