import 'package:flutter/material.dart';
import '../models/product.dart';

class StoreProvider extends ChangeNotifier {
  // Live Metal Rates (per gram in INR)
  double gold22Rate = 7250.0;
  double gold24Rate = 7910.0;
  double silverRate = 92.5;

  // Shopping Cart State
  final List<Product> _cartItems = [];
  final Map<String, int> _cartQuantities = {};

  // Wishlist State
  final List<Product> _wishlistItems = [];

  // Wallet & Referral State
  double walletBalance = 1500.0; // ₹1,500 initial virtual wallet balance!
  final String referralCode = "ARHAM88GOLD";
  int successfulReferrals = 3;

  // Promotions & Spin Wheel State
  bool hasSpunWheel = false;
  String? activeCouponCode;
  double couponDiscountPercentage = 0.0;

  // Cart Wallet Redemption State
  bool isWalletRedeemed = false;
  final double maxWalletRedemptionCap = 1000.0; // ₹1,000 max wallet discount per order!

  // Getters
  List<Product> get cartItems => _cartItems;
  List<Product> get wishlistItems => _wishlistItems;
  int get cartCount => _cartQuantities.values.fold(0, (sum, qty) => sum + qty);

  // Dynamic Rate Updater
  void updateRates(double gold22, double gold24, double silver) {
    gold22Rate = gold22;
    gold24Rate = gold24;
    silverRate = silver;
    notifyListeners();
  }

  // Get product price based on active live metal rates
  double getProductPrice(Product product) {
    double activeRate = gold22Rate;
    if (product.purity.contains('24KT')) {
      activeRate = gold24Rate;
    } else if (product.purity.contains('18KT')) {
      activeRate = gold22Rate * 0.82; // Approx 18KT rate
    } else if (product.category.toLowerCase() == 'silver') {
      activeRate = silverRate;
    }
    return product.calculatePrice(activeRate);
  }

  // Shopping Cart Operations
  int getProductQuantity(String productId) => _cartQuantities[productId] ?? 0;

  void addToCart(Product product) {
    if (_cartQuantities.containsKey(product.id)) {
      _cartQuantities[product.id] = _cartQuantities[product.id]! + 1;
    } else {
      _cartItems.add(product);
      _cartQuantities[product.id] = 1;
    }
    notifyListeners();
  }

  void decreaseQuantity(Product product) {
    if (!_cartQuantities.containsKey(product.id)) return;

    if (_cartQuantities[product.id] == 1) {
      _cartItems.removeWhere((item) => item.id == product.id);
      _cartQuantities.remove(product.id);
    } else {
      _cartQuantities[product.id] = _cartQuantities[product.id]! - 1;
    }
    notifyListeners();
  }

  void removeFromCart(Product product) {
    _cartItems.removeWhere((item) => item.id == product.id);
    _cartQuantities.remove(product.id);
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    _cartQuantities.clear();
    isWalletRedeemed = false;
    notifyListeners();
  }

  // Wishlist Operations
  bool isWishlisted(String productId) {
    return _wishlistItems.any((item) => item.id == productId);
  }

  void toggleWishlist(Product product) {
    final int index = _wishlistItems.indexWhere((item) => item.id == product.id);
    if (index >= 0) {
      _wishlistItems.removeAt(index);
    } else {
      _wishlistItems.add(product);
    }
    notifyListeners();
  }

  // Wallet Redemption
  void toggleWalletRedemption(bool apply) {
    if (apply && walletBalance <= 0) return;
    isWalletRedeemed = apply;
    notifyListeners();
  }

  // Calculate Order Pricing Details
  double get subtotal {
    double total = 0.0;
    for (var item in _cartItems) {
      final int qty = getProductQuantity(item.id);
      total += getProductPrice(item) * qty;
    }
    return total;
  }

  double get walletDiscount {
    if (!isWalletRedeemed) return 0.0;
    // Cap redemption at ₹1,000 or current wallet balance or the order subtotal (whichever is lower)
    double discount = walletBalance;
    if (discount > maxWalletRedemptionCap) {
      discount = maxWalletRedemptionCap;
    }
    if (discount > subtotal) {
      discount = subtotal;
    }
    return discount;
  }

  double get couponDiscountAmount {
    if (activeCouponCode == null) return 0.0;
    return (subtotal - walletDiscount) * couponDiscountPercentage;
  }

  double get grandTotal {
    final double total = subtotal - walletDiscount - couponDiscountAmount;
    return total < 0 ? 0.0 : total;
  }

  // Spin Wheel & Wallet Operations
  void redeemSpinWheelPrize(double prizeValue, String code) {
    walletBalance += prizeValue;
    activeCouponCode = code;
    couponDiscountPercentage = 0.05; // 5% flat coupon discount!
    hasSpunWheel = true;
    notifyListeners();
  }

  void addReferralBonus() {
    walletBalance += 200.0; // ₹200 for successful referral
    successfulReferrals += 1;
    notifyListeners();
  }

  void setSpunWheel() {
    hasSpunWheel = true;
    notifyListeners();
  }
}
