import { useState, useEffect } from 'react';
import { FaSearch } from "react-icons/fa";
import { IoCloseCircle } from 'react-icons/io5';

const SearchBar = ({ placeholder, onSearch, value }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const clearInput = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Search input"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 transition-colors duration-200"
            aria-label="Bersihkan pencarian"
            title="Bersihkan pencarian"
          >
            <IoCloseCircle size={18} />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Search"
          title="Search"
        >
          <FaSearch className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
