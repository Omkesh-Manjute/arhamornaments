import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
import ReturnsPage from './pages/ReturnsPage';
import EducationPage from './pages/EducationPage';
import LuckyWheel from './components/LuckyWheel';
import LivePriceTicker from './components/LivePriceTicker';
import { WishlistProvider } from './context/WishlistContext';
import { PriceProvider } from './context/PriceContext';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <LivePriceTicker />}
      {!isAdminPage && <Header />}
      
      <main className={`flex-1 ${!isAdminPage ? 'pt-[36px] lg:pt-0' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/category/:category" element={<ProductListing />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/support" element={<FAQPage />} />
          <Route path="/return" element={<ReturnsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/academy" element={<EducationPage />} />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
      {!isAdminPage && <LuckyWheel />}
    </div>
  );
};

function App() {
  return (
    <PriceProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <HashRouter>
              <AppContent />
            </HashRouter>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </PriceProvider>
  );
}


export default App;
