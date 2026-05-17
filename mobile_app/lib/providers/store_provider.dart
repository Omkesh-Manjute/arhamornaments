import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';
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

  // Products State
  List<Product> _products = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Dynamic Homepage Assets State
  List<Map<String, dynamic>> _heroBanners = [];
  List<Map<String, dynamic>> _occasions = [];
  List<Map<String, dynamic>> _genderSections = [];

  StoreProvider() {
    fetchProducts();
    fetchHomepageConfig();
  }

  // Getters
  List<Product> get products => _products.isEmpty ? mockProducts : _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<Map<String, dynamic>> get heroBanners => _heroBanners.isEmpty ? _heroBannersFallback : _heroBanners;
  List<Map<String, dynamic>> get occasions => _occasions.isEmpty ? _occasionsFallback : _occasions;
  List<Map<String, dynamic>> get genderSections => _genderSections.isEmpty ? _genderSectionsFallback : _genderSections;

  // Fallback structures for seamless offline support
  static final List<Map<String, dynamic>> _heroBannersFallback = [
    {
      'id': '1',
      'title': 'NEW ARRIVAL',
      'subtitle': '22CT Handcrafted Masterpieces',
      'image': 'https://firebasestorage.googleapis.com/v0/b/arham-ornaments-ee5f3.firebasestorage.app/o/products%2F1778668462941_19.jpg?alt=media&token=9bb368d9-8432-4a7e-8d84-d66bbcbdffb7',
      'link': '/products?category=necklace-sets',
    },
    {
      'id': '2',
      'title': 'READY STOCK',
      'subtitle': '18CT Modern Gold Bracelets',
      'image': 'https://firebasestorage.googleapis.com/v0/b/arham-ornaments-ee5f3.firebasestorage.app/o/products%2F1778656254117_Braclet%20(003)-page-00001.jpg?alt=media&token=dcac1dec-83e8-4aac-934d-88945b6e77db',
      'link': '/products?category=bracelets',
    },
    {
      'id': '3',
      'title': 'MIX RAJKOT',
      'subtitle': 'Timeless Intricate Bangles',
      'image': 'https://firebasestorage.googleapis.com/v0/b/arham-ornaments-ee5f3.firebasestorage.app/o/products%2F1778667743275_81.jpg?alt=media&token=0f75b73e-d507-421c-b2d3-dc36e8600951',
      'link': '/products?category=bangles',
    },
    {
      'id': '4',
      'title': "MEN'S COLLECTION",
      'subtitle': 'Premium Gold Chains & Rings',
      'image': 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1200&auto=format&fit=crop',
      'link': '/products?gender=men',
    },
    {
      'id': '5',
      'title': 'LADIES CHAIN',
      'subtitle': 'Everyday 22CT Gold Elegance',
      'image': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
      'link': '/products?category=chains',
    },
    {
      'id': '6',
      'title': 'MANGALSUTRA',
      'subtitle': 'Heritage Gold Sacred Designs',
      'image': 'https://firebasestorage.googleapis.com/v0/b/arham-ornaments-ee5f3.firebasestorage.app/o/products%2F1778667574617_22kt%20temple%20murti%20pendent%2010%20(004)_page-0001.jpg?alt=media&token=86746fe6-c74a-4598-a7f9-5bf0538bbf94',
      'link': '/products?category=mangalsutras',
    }
  ];

  static final List<Map<String, dynamic>> _occasionsFallback = [
    {
      'name': 'Office Wear',
      'image': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
      'path': '/products?filter=office',
      'description': 'Minimalist professional elegance',
    },
    {
      'name': 'Modern Wear',
      'image': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      'path': '/products?filter=modern',
      'description': 'Contemporary chic designs',
    },
    {
      'name': 'Casual Wear',
      'image': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
      'path': '/products?filter=casual',
      'description': 'Everyday understated luxury',
    },
    {
      'name': 'Traditional Wear',
      'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
      'path': '/products?filter=traditional',
      'description': 'Heritage ethnic masterpieces',
    }
  ];

  static final List<Map<String, dynamic>> _genderSectionsFallback = [
    {
      'name': 'Men',
      'image': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
      'path': '/products?gender=men',
      'gridClass': 'col-span-1',
    },
    {
      'name': 'Kids',
      'image': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop',
      'path': '/products?gender=kids',
      'gridClass': 'col-span-1',
    },
    {
      'name': 'Women',
      'image': 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=1200&auto=format&fit=crop',
      'path': '/products?gender=women',
      'gridClass': 'col-span-2',
    }
  ];

  String _getString(dynamic field, String fallback) {
    if (field == null) return fallback;
    if (field is Map) {
      if (field.containsKey('stringValue')) {
        return field['stringValue']?.toString() ?? fallback;
      }
      if (field.containsKey('integerValue')) {
        return field['integerValue']?.toString() ?? fallback;
      }
    }
    return fallback;
  }

  bool _getBool(dynamic field, bool fallback) {
    if (field == null) return fallback;
    if (field is Map && field.containsKey('booleanValue')) {
      return field['booleanValue'] as bool? ?? fallback;
    }
    return fallback;
  }

  Future<void> fetchHomepageConfig() async {
    final client = HttpClient();
    try {
      final request = await client.getUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/settings/homepage_sections'
      ));
      final response = await request.close();
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final Map<String, dynamic> data = json.decode(responseBody);
        final fields = data['fields'];
        if (fields != null) {
          // Parse Banners
          if (fields['heroBanners'] != null && fields['heroBanners']['arrayValue'] != null) {
            final List<dynamic>? values = fields['heroBanners']['arrayValue']['values'];
            if (values != null) {
              final List<Map<String, dynamic>> banners = [];
              for (var val in values) {
                final map = val['mapValue']?['fields'];
                if (map != null) {
                  final bool isActive = _getBool(map['isActive'], true);
                  if (isActive) {
                    banners.add({
                      'id': _getString(map['id'], ''),
                      'title': _getString(map['title'], ''),
                      'subtitle': _getString(map['subtitle'], ''),
                      'image': _getString(map['image'], ''),
                      'link': _getString(map['link'], ''),
                    });
                  }
                }
              }
              _heroBanners = banners;
            }
          }

          // Parse Occasions
          if (fields['occasions'] != null && fields['occasions']['arrayValue'] != null) {
            final List<dynamic>? values = fields['occasions']['arrayValue']['values'];
            if (values != null) {
              final List<Map<String, dynamic>> occs = [];
              for (var val in values) {
                final map = val['mapValue']?['fields'];
                if (map != null) {
                  occs.add({
                    'name': _getString(map['name'], ''),
                    'image': _getString(map['image'], ''),
                    'path': _getString(map['path'], ''),
                    'description': _getString(map['description'], ''),
                  });
                }
              }
              _occasions = occs;
            }
          }

          // Parse Genders
          if (fields['genderSections'] != null && fields['genderSections']['arrayValue'] != null) {
            final List<dynamic>? values = fields['genderSections']['arrayValue']['values'];
            if (values != null) {
              final List<Map<String, dynamic>> genders = [];
              for (var val in values) {
                final map = val['mapValue']?['fields'];
                if (map != null) {
                  genders.add({
                    'name': _getString(map['name'], ''),
                    'image': _getString(map['image'], ''),
                    'path': _getString(map['path'], ''),
                    'gridClass': _getString(map['gridClass'], ''),
                  });
                }
              }
              _genderSections = genders;
            }
          }
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching homepage config from Firestore: $e');
    } finally {
      client.close();
    }
  }


  List<Product> get cartItems => _cartItems;
  List<Product> get wishlistItems => _wishlistItems;
  int get cartCount => _cartQuantities.values.fold(0, (sum, qty) => sum + qty);

  Future<void> fetchProducts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final client = HttpClient();
    try {
      final request = await client.getUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/products?pageSize=300'
      ));
      final response = await request.close();
      
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final Map<String, dynamic> data = json.decode(responseBody);
        
        final List<dynamic>? docs = data['documents'];
        if (docs != null) {
          final List<Product> loadedProducts = [];
          for (var doc in docs) {
            try {
              loadedProducts.add(Product.fromJson(doc));
            } catch (e) {
              debugPrint('Error parsing single product: $e');
            }
          }
          _products = loadedProducts;
        }
      } else {
        _errorMessage = 'Server error: ${response.statusCode}';
      }
    } catch (e) {
      _errorMessage = 'Network error: $e';
    } finally {
      client.close();
      _isLoading = false;
      notifyListeners();
    }
  }

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
