import React from 'react';
import { Search, Camera, Mic } from 'lucide-react';

const MobileSearchBar: React.FC = () => {
  return (
    <div className="px-4 py-3 bg-white block lg:hidden">
      <div className="relative flex items-center bg-offwhite rounded-2xl border border-gray-100 shadow-inner px-4 py-3.5 group transition-all focus-within:ring-2 focus-within:ring-gold/20">
        <Search className="text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search for jewellery on Arham" 
          className="flex-1 bg-transparent border-none focus:ring-0 px-3 text-sm font-medium text-charcoal placeholder:text-gray-400"
        />
        <div className="flex items-center gap-4 text-gray-400">
          <button className="hover:text-gold transition-colors">
            <Camera size={20} />
          </button>
          <div className="w-[1px] h-4 bg-gray-200" />
          <button className="hover:text-gold transition-colors">
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSearchBar;
