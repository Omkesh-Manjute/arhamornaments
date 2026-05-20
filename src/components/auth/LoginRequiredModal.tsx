import React from 'react';
import { useUser } from '../../context/UserContext';
import { Lock, X } from 'lucide-react';

const LoginRequiredModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen } = useUser();

  if (!isLoginModalOpen) return null;

  const handleLogin = () => {
    setLoginModalOpen(false);
    window.dispatchEvent(new CustomEvent('open-lucky-wheel'));
  };

  const handleCancel = () => {
    setLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl relative animate-bounce-in">
        <button 
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-charcoal bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock size={28} />
          </div>
          
          <h2 className="text-2xl font-bold text-charcoal">Login Required</h2>
          
          <p className="text-sm text-gray-500 leading-relaxed pb-2">
            Please log in or create an account to view products, categories, wishlist, and place orders.
          </p>
          
          <div className="flex flex-col gap-3 mt-6">
            <button 
              onClick={handleLogin}
              className="w-full bg-charcoal text-white py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-md text-xs"
            >
              Login
            </button>
            <button 
              onClick={handleLogin}
              className="w-full bg-gold text-white py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-charcoal transition-all shadow-md text-xs"
            >
              Create Account
            </button>
            <button 
              onClick={handleCancel}
              className="w-full text-gray-500 py-3.5 rounded-xl font-bold uppercase tracking-widest hover:text-charcoal transition-colors text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
