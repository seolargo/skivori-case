# Project Overview

This project is a **React-based web application** designed to showcase modern front-end development practices, including **lazy loading**, **error handling**, and **client-side routing**. The application is structured to demonstrate clean code organization, modularity, and performance optimization.

## Key Features

### Lazy Loading with React.lazy and Suspense
- Components like `HomePage`, `GamesList`, `SlotMachine`, and `NotFound` are dynamically imported to reduce the initial bundle size and improve load times.
- A `LoadingSpinner` component is displayed as a fallback UI while the lazy-loaded components are being fetched.

### Error Handling with Error Boundaries
- The application uses `react-error-boundary` to gracefully handle runtime errors and display a user-friendly `ErrorFallback` component when something goes wrong.

### Routing with React Router DOM
- The app implements client-side routing using `react-router-dom`, allowing seamless navigation between pages like the homepage, games list, and slot machine.

### Modular and Scalable Folder Structure
The project is organized into clear, modular directories:
- **Pages:** Contains individual page components (e.g., `HomePage`, `GamesList`, `SlotMachine`, `NotFound`).
- **Components:** Reusable UI components like `LoadingSpinner` and `ErrorFallback`.
- **Services:** Houses utility functions and API services (e.g., `currencyService`, `gamesService`).
- **Interfaces:** Defines TypeScript interfaces for consistent data structures.
- **Utils:** Includes helper functions like `devLog` and `sanitizeInput` for debugging and input validation.

### TypeScript Support
- The project leverages TypeScript for type safety and better developer tooling, ensuring robust and maintainable code.

### Testing
- Test files (e.g., `HomePage.test.js`, `GamesList.test.js`) are included for key components, demonstrating a commitment to code quality and reliability.

## Technical Stack
- **Frontend:** React, React Router DOM, TypeScript
- **Performance Optimization:** Lazy loading, Suspense
- **Error Handling:** React Error Boundary
- **Styling:** CSS modules for component-specific styles
- **Utilities:** Custom utility functions for debugging and input sanitization

## Why This Project Stands Out
- **Performance-Centric Design:** By implementing lazy loading, the app ensures faster load times and a smoother user experience.
- **Robust Error Handling:** The use of error boundaries ensures that the app remains user-friendly even when unexpected issues arise.
- **Scalable Architecture:** The modular folder structure and TypeScript integration make the codebase easy to maintain and extend.
- **Attention to Detail:** Includes reusable components, utility functions, and test cases, showcasing a thorough approach to development.