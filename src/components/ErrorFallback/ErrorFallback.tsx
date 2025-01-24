import './ErrorFallback.css'; // Optional: Add styles for the error fallback

export const ErrorFallback = ({ error }: { error: Error }) => {
    return (
        <div className="error-fallback">
            <h1>Something went wrong</h1>
            <p>{error.message}</p>
            <button
                className="error-fallback__button"
                onClick={() => window.location.reload()}
            >
                Try Again
            </button>
        </div>
    );
};

export default ErrorFallback;