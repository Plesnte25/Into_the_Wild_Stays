import React from "react";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100 p-4">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-lg mb-6">Sorry, the page you are looking for does not exist.</p>
            <a className="text-blue-500 hover:underline" href="/">Go back to Home</a>
        </div>
    );
};

export default NotFound;