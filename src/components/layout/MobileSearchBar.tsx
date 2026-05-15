import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="px-4 pt-1 pb-2 bg-white block lg:hidden">
      <form onSubmit={handleSearch} className="relative flex items-center bg-offwhite rounded-2xl border border-gray-100 shadow-inner px-4 py-3.5 group transition-all focus-within:ring-2 focus-within:ring-gold/20">
        <Search className="text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for jewellery on Arham" 
          className="flex-1 bg-transparent border-none focus:ring-0 px-3 text-sm font-medium text-charcoal placeholder:text-gray-400 outline-none"
        />
      </form>
    </div>
  );
};

export default MobileSearchBar;
