import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Gift, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatPrice } from '../../utils/whatsapp';

export const SlideCartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setCartDrawerOpen,
    items,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalItems
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartDrawerOpen(false);
      }
    };
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartDrawerOpen, setCartDrawerOpen]);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setCartDrawerOpen(false);
    }
  };

  if (!isCartDrawerOpen) return null;

  // Shipping goal logic
  const shippingGoal = 10000;
  const progressPercent = Math.min((totalPrice / shippingGoal) * 100, 100);
  const remainingForFree = shippingGoal - totalPrice;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
    >
      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-md flex-col bg-white text-charcoal shadow-2xl transition-transform duration-300 translate-x-0 animate-slide-in-right z-[101]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 md:p-6 bg-gradient-to-r from-offwhite via-white to-offwhite">
          <div className="flex items-center gap-2">
            <div className="relative p-2 rounded-full bg-gold/10 text-gold">
              <ShoppingBag size={20} className="animate-wiggle" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold uppercase tracking-widest text-charcoal">Your Cart</h2>
              <p className="text-[10px] text-gray-400 font-medium">Premium Jewellery Selection</p>
            </div>
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-charcoal transition-all"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress for Free Shipping */}
        {totalItems > 0 && (
          <div className="bg-gold/5 p-4 border-b border-gold/10">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              {remainingForFree > 0 ? (
                <p className="text-gray-600">
                  Add <span className="text-gold font-bold">{formatPrice(remainingForFree)}</span> more for{' '}
                  <span className="text-gold font-bold">Free Luxury Gift Wrapping</span>
                </p>
              ) : (
                <p className="text-emerald-600 flex items-center gap-1">
                  <Gift size={14} className="animate-bounce" /> Congratulations! You unlocked{' '}
                  <span className="font-bold">Free Luxury Wrapping</span>
                </p>
              )}
              <span className="text-[10px] text-gray-400 font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold via-gold-light to-gold-dark rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-offwhite flex items-center justify-center text-gray-300 relative border border-gray-100">
                <ShoppingBag size={36} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full animate-ping" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal">Your cart is empty</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">
                  Explore our curated collections of breathtaking gold & diamond ornaments.
                </p>
              </div>
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/products');
                }}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-charcoal to-black hover:from-gold hover:to-gold-dark text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Browse Masterpieces
              </button>
            </div>
          ) : (
            items.map((item) => {
              if (!item || !item.product) return null;
              const { product } = item;
              return (
                <div
                  key={`${item.product.id}-${item.selectedPurity || ''}-${item.selectedDiamondQuality || ''}`}
                  className="flex gap-4 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-offwhite border border-gray-50">
                    <img
                      src={product.images?.[0] || product.image || '/placeholder.png'}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs md:text-sm font-bold text-charcoal line-clamp-1 group-hover:text-gold transition-colors">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      {/* Meta configurations */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.selectedPurity && (
                          <span className="px-1.5 py-0.5 rounded bg-gold/10 text-[9px] font-bold text-gold uppercase tracking-wider">
                            Purity: {item.selectedPurity}
                          </span>
                        )}
                        {item.selectedDiamondQuality && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[9px] font-bold text-amber-600 uppercase tracking-wider">
                            Diamond: {item.selectedDiamondQuality}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-full bg-offwhite border border-gray-100 p-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-charcoal hover:bg-white rounded-full transition-all"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-charcoal hover:bg-white rounded-full transition-all"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block line-through">
                          {formatPrice(product.price * 1.15 * item.quantity)}
                        </span>
                        <span className="text-sm font-bold text-gold">
                          {formatPrice(product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area with checkout & summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 md:p-6 bg-gradient-to-b from-white to-offwhite space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Luxury Shipping & Tax</span>
                <span className="text-emerald-500 font-medium">FREE</span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-charcoal uppercase tracking-wider">Total Value</span>
                <span className="text-xl font-bold text-gold">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/cart');
                }}
                className="w-full py-3 border border-gray-200 rounded-full text-xs font-bold uppercase tracking-widest text-charcoal hover:bg-offwhite transition-all transform active:scale-95 text-center block"
              >
                View Full Cart
              </button>
              
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3 bg-gradient-to-r from-gold via-gold-light to-gold-dark text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:brightness-105 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Secure Badges */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-gold" />
                100% Certified Gold
              </span>
              <span className="h-3 w-px bg-gray-200" />
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-gold" />
                Fully Insured Shipping
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
