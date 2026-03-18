import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="min-h-100 flex items-center justify-center">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="mt-4 text-sm text-gray-500">Loading...</div>
            </div>
        </div>
    );
};

export default Loader;