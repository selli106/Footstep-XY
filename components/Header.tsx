
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-6 md:px-8 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3.5a1.5 1.5 0 011.5 1.5v1.5H15a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-1.5 1.5H11.5v1.5a1.5 1.5 0 01-3 0v-1.5H5a1.5 1.5 0 01-1.5-1.5v-5A1.5 1.5 0 015 6.5h3.5V5A1.5 1.5 0 0110 3.5zM8.5 8H5v5h3.5V8zm6.5 0H11.5v5H15V8z" />
        </svg>
        <h1 className="text-xl md:text-2xl font-bold tracking-wider text-white">
          Footsteps XY
        </h1>
      </div>
    </header>
  );
};

export default Header;