import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';

class StoreProvider extends ChangeNotifier {
  // Live Metal Rates (per gram in INR)
  double gold22Rate = 7250.0;
  double gold24Rate = 7910.0;
  double silverRate = 92.5;
  double silver1kgRate = 0.0;   // Silver per kg
  double platinumRate = 0.0;    // Platinum per gram
  DateTime? ratesLastUpdated;   // Last time rates were fetched

  // Shopping Cart State
  final List<Product> _cartItems = [];
  final Map<String, int> _cartQuantities = {};

  // Wishlist State
  final List<Product> _wishlistItems = [];

  // Authentication & User Session State
  bool isLoggedIn = false;
  String userName = "Arham Guest";
  String userEmail = "guest@arhamornaments.com";
  String userPhone = "+91 9371504182";
  String streetAddress = "12, Gold Souk Market";
  String city = "Mumbai";
  String pinCode = "400002";
  String userReferralCode = "OMK21NR";
  String get referralCode => userReferralCode;
  String appliedReferralCode = "";

  // Dynamic Firestore State
  String? userUid;
  bool isSyncingUser = false;

  // Wallet & Referral State
  double walletBalance = 0.0; // Starts at ₹0 for fresh users, gets loaded with signup & spins!
  double referralEarnings = 200.0; // Displayed on green Referral card
  int successfulReferrals = 2; // Starts with mock value or counter
  String programTier = "Elite";
  String inviteStatus = "Active";

  // Promotions & Spin Wheel State
  bool hasSpunWheel = false;
  String? activeCouponCode;
  double couponDiscountPercentage = 0.0;

  // Cart Wallet Redemption State
  bool isWalletRedeemed = false;
  final double maxWalletRedemptionCap = 1000.0; // ₹1,000 max wallet discount per order!

  // Successful Referrals History List
  List<Map<String, dynamic>> referralsHistory = [
    {'name': 'Rajesh Kumar', 'date': '15 May 2026', 'amount': 100.0, 'avatar': 'R'},
    {'name': 'Amit Sharma', 'date': '14 May 2026', 'amount': 100.0, 'avatar': 'A'},
  ];

  // Dynamic Notification List with Clickable Actions
  List<Map<String, dynamic>> notificationsList = [
    {
      'id': '1',
      'title': 'Arham New Designs Sparkle!',
      'description': 'Discover our latest 22KT Handcrafted Necklace designs in catalog.',
      'date': '16 May 2026',
      'link': '/products?category=necklace-sets',
      'read': false
    },
    {
      'id': '2',
      'title': 'Hello Sir, Welcome!',
      'description': 'Thank you for choosing Arham Ornaments. Check our direct support line if you need anything.',
      'date': '15 May 2026',
      'link': 'tel:+919371504182',
      'read': true
    },
    {
      'id': '3',
      'title': 'Lucky Spin Reward Unlocked 🎁',
      'description': 'Congratulations! You won ₹500 in your spin wheel today. Use coupon LUCKY500.',
      'date': '14 May 2026',
      'link': '/profile',
      'read': true
    }
  ];

  // Ledger Transaction History Logs
  List<Map<String, dynamic>> transactionsHistory = [
    {'title': 'Referral Bonus - Rajesh Kumar', 'date': '15 May 2026', 'amount': 100.0, 'type': 'referral'},
    {'title': 'Referral Bonus - Amit Sharma', 'date': '14 May 2026', 'amount': 100.0, 'type': 'referral'},
    {'title': 'Lucky Spin Wheel Reward', 'date': '14 May 2026', 'amount': 500.0, 'type': 'spin'},
  ];

  // Products State
  List<Product> _products = [];
  bool _isLoading = false;
  String? _errorMessage;

  // Dynamic Homepage Assets State
  List<Map<String, dynamic>> _heroBanners = [];
  List<Map<String, dynamic>> _occasions = [];
  List<Map<String, dynamic>> _genderSections = [];
  List<String> _bestSellersIds = [];
  List<String> _newArrivalsIds = [];

  StoreProvider() {
    fetchProducts();
    fetchHomepageConfig();
    fetchCoupons();
    fetchMetadataRates();
  }

  // Getters
  List<Product> get products => _products.isEmpty ? mockProducts : _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<Map<String, dynamic>> get heroBanners => _heroBanners.isEmpty ? _heroBannersFallback : _heroBanners;
  List<Map<String, dynamic>> get occasions => _occasions.isEmpty ? _occasionsFallback : _occasions;
  List<Map<String, dynamic>> get genderSections => _genderSections.isEmpty ? _genderSectionsFallback : _genderSections;

  List<Product> get bestSellersProducts {
    final List<Product> allProds = products;
    if (_bestSellersIds.isEmpty) {
      return allProds.where((p) => p.isBestSeller).toList();
    }
    final List<Product> list = [];
    for (final id in _bestSellersIds) {
      final match = allProds.where((p) => p.id == id).toList();
      if (match.isNotEmpty) {
        list.add(match.first);
      }
    }
    return list.isEmpty ? allProds.where((p) => p.isBestSeller).toList() : list;
  }

  List<Product> get newArrivalsProducts {
    final List<Product> allProds = products;
    if (_newArrivalsIds.isEmpty) {
      return allProds.where((p) => p.isNewArrival).toList();
    }
    final List<Product> list = [];
    for (final id in _newArrivalsIds) {
      final match = allProds.where((p) => p.id == id).toList();
      if (match.isNotEmpty) {
        list.add(match.first);
      }
    }
    return list.isEmpty ? allProds.where((p) => p.isNewArrival).toList() : list;
  }

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
      'image': 'assets/men_gender.png',
      'path': '/products?gender=men',
      'gridClass': 'col-span-1',
    },
    {
      'name': 'Kids',
      'image': 'assets/kids_gender.png',
      'path': '/products?gender=kids',
      'gridClass': 'col-span-1',
    },
    {
      'name': 'Women',
      'image': 'assets/women_gender.png',
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
                  final String name = _getString(map['name'], '');
                  String image = _getString(map['image'], '');

                  // Standardize and force premium local assets if available
                  final String lowerName = name.toLowerCase();
                  if (lowerName == 'men') {
                    image = 'assets/men_gender.png';
                  } else if (lowerName == 'women') {
                    image = 'assets/women_gender.png';
                  } else if (lowerName == 'kids') {
                    image = 'assets/kids_gender.png';
                  }

                  genders.add({
                    'name': name,
                    'image': image,
                    'path': _getString(map['path'], ''),
                    'gridClass': _getString(map['gridClass'], ''),
                  });
                }
              }
              _genderSections = genders;
            }
          }

          // Parse Best Sellers IDs
          if (fields['bestSellers'] != null && fields['bestSellers']['arrayValue'] != null) {
            final List<dynamic>? values = fields['bestSellers']['arrayValue']['values'];
            if (values != null) {
              _bestSellersIds = values
                  .map((v) => v['stringValue']?.toString() ?? '')
                  .where((id) => id.isNotEmpty)
                  .toList();
            }
          }

          // Parse New Arrivals IDs
          if (fields['newArrivals'] != null && fields['newArrivals']['arrayValue'] != null) {
            final List<dynamic>? values = fields['newArrivals']['arrayValue']['values'];
            if (values != null) {
              _newArrivalsIds = values
                  .map((v) => v['stringValue']?.toString() ?? '')
                  .where((id) => id.isNotEmpty)
                  .toList();
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

  bool get hasAnyValidCoupon {
    return adminCoupons.any((c) {
      final bool isActive = c['isActive'] ?? false;
      if (!isActive) return false;
      
      final String expiryStr = c['expiryDate'] ?? '';
      if (expiryStr.isNotEmpty) {
        final DateTime? expiryDate = DateTime.tryParse(expiryStr);
        if (expiryDate != null) {
          final DateTime endOfDay = DateTime(expiryDate.year, expiryDate.month, expiryDate.day, 23, 59, 59);
          if (DateTime.now().isAfter(endOfDay)) return false;
        }
      }
      return true;
    });
  }

  Future<void> fetchCoupons() async {
    final client = HttpClient();
    try {
      final request = await client.getUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/coupons'
      ));
      final response = await request.close();
      
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final Map<String, dynamic> data = json.decode(responseBody);
        
        final List<dynamic>? docs = data['documents'];
        if (docs != null) {
          final List<Map<String, dynamic>> loadedCoupons = [];
          for (var doc in docs) {
            try {
              final Map<String, dynamic> fields = doc['fields'] ?? {};
              
              final String code = _getString(fields['code'], '').trim().toUpperCase();
              final String discountType = _getString(fields['discountType'], 'fixed');
              
              double discountValue = 0.0;
              final discValObj = fields['discountValue'];
              if (discValObj != null) {
                discountValue = double.tryParse(discValObj['integerValue'] ?? discValObj['doubleValue']?.toString() ?? '0') ?? 0.0;
              }
              
              double minOrderAmount = 0.0;
              final minOrderObj = fields['minOrderAmount'];
              if (minOrderObj != null) {
                minOrderAmount = double.tryParse(minOrderObj['integerValue'] ?? minOrderObj['doubleValue']?.toString() ?? '0') ?? 0.0;
              }
              
              final String expiryDate = _getString(fields['expiryDate'], '');
              final bool isActive = _getBool(fields['isActive'], false);
              
              int? usageLimit;
              final limitObj = fields['usageLimit'];
              if (limitObj != null) {
                usageLimit = int.tryParse(limitObj['integerValue'] ?? limitObj['doubleValue']?.toString() ?? '');
              }
              
              int usageCount = 0;
              final countObj = fields['usageCount'];
              if (countObj != null) {
                usageCount = int.tryParse(countObj['integerValue'] ?? countObj['doubleValue']?.toString() ?? '0') ?? 0;
              }
              
              if (code.isNotEmpty) {
                loadedCoupons.add({
                  'code': code,
                  'discountType': discountType,
                  'discountValue': discountValue,
                  'minOrderAmount': minOrderAmount,
                  'expiryDate': expiryDate,
                  'isActive': isActive,
                  'usageLimit': usageLimit,
                  'usageCount': usageCount,
                });
              }
            } catch (e) {
              debugPrint('Error parsing single coupon: $e');
            }
          }
          adminCoupons.clear();
          adminCoupons.addAll(loadedCoupons);
          debugPrint('Successfully loaded ${adminCoupons.length} coupons from Firestore!');
          
          validateActiveCoupon();
        }
      }
    } catch (e) {
      debugPrint('Failed to fetch coupons from Firestore: $e');
    } finally {
      client.close();
      notifyListeners();
    }
  }

  void validateActiveCoupon() {
    if (activeCouponCode == null) return;
    
    final matched = adminCoupons.firstWhere(
      (c) => c['code'] == activeCouponCode,
      orElse: () => <String, dynamic>{},
    );
    
    if (matched.isEmpty) {
      activeCouponCode = null;
      couponDiscountPercentage = 0.0;
      return;
    }
    
    final bool isActive = matched['isActive'] ?? false;
    if (!isActive) {
      activeCouponCode = null;
      couponDiscountPercentage = 0.0;
      return;
    }
    
    final String expiryStr = matched['expiryDate'] ?? '';
    if (expiryStr.isNotEmpty) {
      final DateTime? expiryDate = DateTime.tryParse(expiryStr);
      if (expiryDate != null) {
        final DateTime endOfDay = DateTime(expiryDate.year, expiryDate.month, expiryDate.day, 23, 59, 59);
        if (DateTime.now().isAfter(endOfDay)) {
          activeCouponCode = null;
          couponDiscountPercentage = 0.0;
          return;
        }
      }
    }
    
    final double minAmount = (matched['minOrderAmount'] as num?)?.toDouble() ?? 0.0;
    if (subtotal < minAmount) {
      activeCouponCode = null;
      couponDiscountPercentage = 0.0;
      return;
    }
    
    final int? limit = matched['usageLimit'];
    final int count = matched['usageCount'] ?? 0;
    if (limit != null && count >= limit) {
      activeCouponCode = null;
      couponDiscountPercentage = 0.0;
      return;
    }
  }

  // Dynamic Rate Updater
  void updateRates(double gold22, double gold24, double silver) {
    gold22Rate = gold22;
    gold24Rate = gold24;
    silverRate = silver;
    notifyListeners();
  }

  // Fetch all metal rates from Firestore metadata/rates
  Future<void> fetchMetadataRates() async {
    final client = HttpClient();
    try {
      final request = await client.getUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/metadata/rates'
      ));
      final response = await request.close();
      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final Map<String, dynamic> data = json.decode(body);
        final fields = data['fields'];
        if (fields != null) {
          gold22Rate = _getDouble(fields['gold22K'], gold22Rate);
          gold24Rate = _getDouble(fields['gold24K'], gold24Rate);
          silverRate = _getDouble(fields['silver'], silverRate);
          silver1kgRate = _getDouble(fields['silver1kg'], silver1kgRate);
          platinumRate = _getDouble(fields['platinum'], platinumRate);
          ratesLastUpdated = DateTime.now();
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error fetching metadata rates: $e');
    } finally {
      client.close();
    }
  }

  double _getDouble(dynamic field, double fallback) {
    if (field == null) return fallback;
    if (field['doubleValue'] != null) return (field['doubleValue'] as num).toDouble();
    if (field['integerValue'] != null) return double.tryParse(field['integerValue'].toString()) ?? fallback;
    if (field['stringValue'] != null) return double.tryParse(field['stringValue'].toString()) ?? fallback;
    return fallback;
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
    validateActiveCoupon();
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
    validateActiveCoupon();
    notifyListeners();
  }

  void removeFromCart(Product product) {
    _cartItems.removeWhere((item) => item.id == product.id);
    _cartQuantities.remove(product.id);
    validateActiveCoupon();
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    _cartQuantities.clear();
    isWalletRedeemed = false;
    activeCouponCode = null;
    couponDiscountPercentage = 0.0;
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
    final matched = adminCoupons.firstWhere(
      (c) => c['code'] == activeCouponCode,
      orElse: () => <String, dynamic>{},
    );
    if (matched.isEmpty) return 0.0;
    
    final String type = matched['discountType'] ?? 'fixed';
    final double value = (matched['discountValue'] as num?)?.toDouble() ?? 0.0;
    
    if (type == 'percentage') {
      return (subtotal - walletDiscount) * (value / 100.0);
    } else {
      final double remaining = subtotal - walletDiscount;
      return value > remaining ? remaining : value;
    }
  }

  double get grandTotal {
    final double total = subtotal - walletDiscount - couponDiscountAmount;
    return total < 0 ? 0.0 : total;
  }

  // Static registries to persist user states across logout-login bounds by unique phone number
  static final Map<String, double> _phoneToWallet = {};
  static final Map<String, bool> _phoneToHasSpun = {};
  static final Map<String, int> _phoneToReferralCount = {};
  static final Map<String, double> _phoneToReferralEarnings = {};
  static final Map<String, List<Map<String, dynamic>>> _phoneToReferralsHistory = {};
  static final Map<String, List<Map<String, dynamic>>> _phoneToTransactionsHistory = {};

  final List<Map<String, dynamic>> adminCoupons = [];

  void _syncToRegistry() {
    final String cleanPhone = userPhone.replaceAll(RegExp(r'\s+'), '');
    _phoneToWallet[cleanPhone] = walletBalance;
    _phoneToHasSpun[cleanPhone] = hasSpunWheel;
    _phoneToReferralCount[cleanPhone] = successfulReferrals;
    _phoneToReferralEarnings[cleanPhone] = referralEarnings;
    _phoneToReferralsHistory[cleanPhone] = List<Map<String, dynamic>>.from(referralsHistory);
    _phoneToTransactionsHistory[cleanPhone] = List<Map<String, dynamic>>.from(transactionsHistory);
    savePersistentState();
  }

  // Local device persistence using SharedPreferences
  Future<void> loadPersistentState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
      userName = prefs.getString('userName') ?? "Arham Guest";
      userEmail = prefs.getString('userEmail') ?? "member@arhamornaments.com";
      userPhone = prefs.getString('userPhone') ?? "+91 9371504182";
      walletBalance = prefs.getDouble('walletBalance') ?? 0.0;
      referralEarnings = prefs.getDouble('referralEarnings') ?? 0.0;
      successfulReferrals = prefs.getInt('successfulReferrals') ?? 0;
      hasSpunWheel = prefs.getBool('hasSpunWheel') ?? false;
      appliedReferralCode = prefs.getString('appliedReferralCode') ?? "";
      userUid = prefs.getString('userUid');
      
      final String? refHistStr = prefs.getString('referralsHistory');
      if (refHistStr != null) {
        referralsHistory = List<Map<String, dynamic>>.from(jsonDecode(refHistStr));
      }
      
      final String? txHistStr = prefs.getString('transactionsHistory');
      if (txHistStr != null) {
        transactionsHistory = List<Map<String, dynamic>>.from(jsonDecode(txHistStr));
      }

      final String? notifListStr = prefs.getString('notificationsList');
      if (notifListStr != null) {
        notificationsList = List<Map<String, dynamic>>.from(jsonDecode(notifListStr));
      }

      final String? phoneWalletStr = prefs.getString('_phoneToWallet');
      if (phoneWalletStr != null) {
        _phoneToWallet.addAll(Map<String, double>.from(jsonDecode(phoneWalletStr)));
      }
      
      final String? phoneSpinStr = prefs.getString('_phoneToHasSpun');
      if (phoneSpinStr != null) {
        _phoneToHasSpun.addAll(Map<String, bool>.from(jsonDecode(phoneSpinStr)));
      }
      
      final String? phoneRefStr = prefs.getString('_phoneToReferralCount');
      if (phoneRefStr != null) {
        _phoneToReferralCount.addAll(Map<String, int>.from(jsonDecode(phoneRefStr)));
      }

      final String? phoneRefEarnStr = prefs.getString('_phoneToReferralEarnings');
      if (phoneRefEarnStr != null) {
        _phoneToReferralEarnings.addAll(Map<String, double>.from(jsonDecode(phoneRefEarnStr)));
      }

      final String? phoneRefHistStr = prefs.getString('_phoneToReferralsHistory');
      if (phoneRefHistStr != null) {
        final rawMap = jsonDecode(phoneRefHistStr) as Map<String, dynamic>;
        rawMap.forEach((key, val) {
          _phoneToReferralsHistory[key] = List<Map<String, dynamic>>.from(val);
        });
      }

      final String? phoneTxHistStr = prefs.getString('_phoneToTransactionsHistory');
      if (phoneTxHistStr != null) {
        final rawMap = jsonDecode(phoneTxHistStr) as Map<String, dynamic>;
        rawMap.forEach((key, val) {
          _phoneToTransactionsHistory[key] = List<Map<String, dynamic>>.from(val);
        });
      }
      
      notifyListeners();

      // Trigger automatic live sync if logged in
      if (isLoggedIn && userPhone.isNotEmpty) {
        fetchLiveUserData(userPhone);
      }
    } catch (e) {
      debugPrint("Error loading persistent state: $e");
    }
  }

  Future<void> savePersistentState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLoggedIn', isLoggedIn);
      await prefs.setString('userName', userName);
      await prefs.setString('userEmail', userEmail);
      await prefs.setString('userPhone', userPhone);
      await prefs.setDouble('walletBalance', walletBalance);
      await prefs.setDouble('referralEarnings', referralEarnings);
      await prefs.setInt('successfulReferrals', successfulReferrals);
      await prefs.setBool('hasSpunWheel', hasSpunWheel);
      await prefs.setString('appliedReferralCode', appliedReferralCode);
      if (userUid != null) {
        await prefs.setString('userUid', userUid!);
      } else {
        await prefs.remove('userUid');
      }
      
      await prefs.setString('referralsHistory', jsonEncode(referralsHistory));
      await prefs.setString('transactionsHistory', jsonEncode(transactionsHistory));
      await prefs.setString('notificationsList', jsonEncode(notificationsList));
      
      await prefs.setString('_phoneToWallet', jsonEncode(_phoneToWallet));
      await prefs.setString('_phoneToHasSpun', jsonEncode(_phoneToHasSpun));
      await prefs.setString('_phoneToReferralCount', jsonEncode(_phoneToReferralCount));
      await prefs.setString('_phoneToReferralEarnings', jsonEncode(_phoneToReferralEarnings));
      await prefs.setString('_phoneToReferralsHistory', jsonEncode(_phoneToReferralsHistory));
      await prefs.setString('_phoneToTransactionsHistory', jsonEncode(_phoneToTransactionsHistory));
    } catch (e) {
      debugPrint("Error saving persistent state: $e");
    }
  }

  // Spin Wheel & Wallet Operations
  void redeemSpinWheelPrize(double prizeValue, String code) {
    walletBalance += prizeValue;
    activeCouponCode = null; // No auto-coupon award anymore!
    couponDiscountPercentage = 0.0;
    hasSpunWheel = true;

    if (prizeValue > 0) {
      transactionsHistory.insert(0, {
        'title': 'Lucky Spin Wheel Reward',
        'date': 'Today',
        'amount': prizeValue,
        'type': 'spin',
      });
      notificationsList.insert(0, {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'title': 'Lucky Spin Winner! 🎉',
        'description': 'You won ₹${prizeValue.toInt()} credits on the lucky spin wheel!',
        'date': 'Today',
        'link': '/profile',
        'read': false,
      });
    }
    _syncToRegistry();
    notifyListeners();

    // TWO-WAY SYNC: Sync wallet balance and spin date to Firestore
    updateFirestoreUserFields({
      'walletBalance': {'integerValue': walletBalance.toInt().toString()},
      'lastSpinDate': {'stringValue': DateTime.now().toUtc().toIso8601String()},
    });
  }

  void deductWallet(double amount) {
    if (amount <= 0) return;
    walletBalance -= amount;
    if (walletBalance < 0) walletBalance = 0.0;

    transactionsHistory.insert(0, {
      'title': 'Redeemed on Checkout',
      'date': 'Today',
      'amount': -amount,
      'type': 'checkout',
    });
    
    _syncToRegistry();
    notifyListeners();
  }

  String? applyCoupon(String code) {
    final cleanCode = code.trim().toUpperCase();
    final matched = adminCoupons.firstWhere(
      (c) => c['code'] == cleanCode,
      orElse: () => <String, dynamic>{},
    );
    if (matched.isEmpty) {
      return 'Coupon code does not exist';
    }
    
    final bool isActive = matched['isActive'] ?? false;
    if (!isActive) {
      return 'This coupon is not active';
    }
    
    final String expiryStr = matched['expiryDate'] ?? '';
    if (expiryStr.isNotEmpty) {
      final DateTime? expiryDate = DateTime.tryParse(expiryStr);
      if (expiryDate != null) {
        final DateTime endOfDay = DateTime(expiryDate.year, expiryDate.month, expiryDate.day, 23, 59, 59);
        if (DateTime.now().isAfter(endOfDay)) {
          return 'This coupon has expired';
        }
      }
    }
    
    final double minAmount = (matched['minOrderAmount'] as num?)?.toDouble() ?? 0.0;
    if (subtotal < minAmount) {
      return 'Minimum order amount of ₹${minAmount.toStringAsFixed(0)} required';
    }
    
    final int? limit = matched['usageLimit'];
    final int count = matched['usageCount'] ?? 0;
    if (limit != null && count >= limit) {
      return 'This coupon usage limit has been exceeded';
    }
    
    activeCouponCode = matched['code'];
    final String type = matched['discountType'] ?? 'fixed';
    final double val = (matched['discountValue'] as num?)?.toDouble() ?? 0.0;
    if (type == 'percentage') {
      couponDiscountPercentage = val / 100.0;
    } else {
      couponDiscountPercentage = 0.0;
    }
    
    notifyListeners();
    return null; // Success
  }

  void removeCoupon() {
    activeCouponCode = null;
    couponDiscountPercentage = 0.0;
    notifyListeners();
  }

  void addReferralBonus() {
    walletBalance += 100.0; // ₹100 for successful referral
    successfulReferrals += 1;
    _syncToRegistry();
    notifyListeners();
  }

  void setSpunWheel() {
    hasSpunWheel = true;
    _syncToRegistry();
    notifyListeners();
  }

  // Registration & User Session flow
  void registerUser(String name, String email, String phone, String refCode) {
    isLoggedIn = true;
    userName = name.isNotEmpty ? name : "Arham Member";
    userEmail = email.isNotEmpty ? email : "member@arhamornaments.com";
    userPhone = phone.isNotEmpty ? phone : "+91 9371504182";
    appliedReferralCode = refCode;

    // Set temporary local state while fetching
    walletBalance = 0.0;
    hasSpunWheel = false;
    successfulReferrals = 0;
    referralEarnings = 0.0;
    referralsHistory = [];
    transactionsHistory = [];

    _syncToRegistry();
    notifyListeners();

    // Call dynamic Firestore user registration/fetching flow
    fetchLiveUserData(userPhone).then((_) {
      if (userUid == null) {
        // If not found in database, create the user
        createFirestoreUser(userName, userEmail, userPhone, refCode);
      }
    });
  }

  // Update Profile details
  void updateProfileDetails(String name, String email, String phone, String address, String cityVal, String zip) {
    userName = name;
    userEmail = email;
    userPhone = phone;
    streetAddress = address;
    city = cityVal;
    pinCode = zip;
    _syncToRegistry();
    notifyListeners();
  }

  // Simulate inviting a friend
  bool simulateReferralInvite(String friendName) {
    if (successfulReferrals >= 10) {
      // Exceeds the max 10 successful monthly referrals rule constraint!
      return false;
    }
    successfulReferrals += 1;
    referralEarnings += 100.0;
    walletBalance += 100.0; // Earn ₹100 per successful referral!

    referralsHistory.insert(0, {
      'name': friendName,
      'date': 'Today',
      'amount': 100.0,
      'avatar': friendName.substring(0, 1).toUpperCase(),
    });
    transactionsHistory.insert(0, {
      'title': 'Referral Bonus - $friendName',
      'date': 'Today',
      'amount': 100.0,
      'type': 'referral',
    });
    notificationsList.insert(0, {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'title': 'Referral Successful! 🌟',
      'description': 'Congratulations! $friendName joined Arham. ₹100 referral cash added.',
      'date': 'Today',
      'link': '/profile',
      'read': false,
    });
    _syncToRegistry();
    notifyListeners();
    return true;
  }

  // Dynamic User & Referrals Fetching from Firestore REST API
  Future<void> fetchLiveUserData(String phone) async {
    if (phone.isEmpty || phone == "+91 9371504182") return;

    String cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(cleanPhone.length - 10);
    }
    if (cleanPhone.isEmpty) return;

    isSyncingUser = true;
    notifyListeners();

    final client = HttpClient();
    try {
      final request = await client.postUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents:runQuery'
      ));
      request.headers.contentType = ContentType.json;
      
      final queryBody = {
        'structuredQuery': {
          'from': [{'collectionId': 'users'}],
          'where': {
            'fieldFilter': {
              'field': {'fieldPath': 'phone'},
              'op': 'EQUAL',
              'value': {'stringValue': cleanPhone}
            }
          }
        }
      };
      
      request.write(jsonEncode(queryBody));
      final response = await request.close();
      
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final List<dynamic> results = json.decode(responseBody);
        
        List<String> uids = [];
        double maxWallet = -1.0;
        Map<String, dynamic>? primaryFields;
        String? primaryUid;
        
        for (var result in results) {
          if (result['document'] != null) {
            final doc = result['document'];
            final fields = doc['fields'];
            final docName = doc['name'] as String;
            final uid = docName.split('/').last;
            uids.add(uid);
            
            double docWallet = 0.0;
            if (fields != null && fields['walletBalance'] != null) {
              final wVal = fields['walletBalance'];
              if (wVal['integerValue'] != null) {
                docWallet = double.tryParse(wVal['integerValue'].toString()) ?? 0.0;
              } else if (wVal['doubleValue'] != null) {
                docWallet = double.tryParse(wVal['doubleValue'].toString()) ?? 0.0;
              } else if (wVal['stringValue'] != null) {
                docWallet = double.tryParse(wVal['stringValue'].toString()) ?? 0.0;
              }
            }
            
            // Choose primary account as the one with the maximum wallet balance or matching our structure
            if (primaryUid == null || docWallet > maxWallet) {
              maxWallet = docWallet;
              primaryUid = uid;
              primaryFields = fields;
            }
          }
        }
        
        if (primaryUid != null && primaryFields != null) {
          userUid = primaryUid;
          userName = _getString(primaryFields['name'], userName);
          userEmail = _getString(primaryFields['email'], userEmail);
          userReferralCode = _getString(primaryFields['referralCode'], userReferralCode);
          programTier = _getString(primaryFields['tier'], programTier);
          streetAddress = _getString(primaryFields['streetAddress'], streetAddress);
          city = _getString(primaryFields['city'], city);
          pinCode = _getString(primaryFields['pincode'], pinCode);
          walletBalance = maxWallet;

          if (primaryFields['lastSpinDate'] != null) {
            final spinDateStr = _getString(primaryFields['lastSpinDate'], "");
            if (spinDateStr.isNotEmpty) {
              hasSpunWheel = true;
            }
          }

          _syncToRegistry();
          notifyListeners();

          await _fetchLiveReferrals(uids);
        }
      }
    } catch (e) {
      debugPrint("Error fetching live user data: $e");
    } finally {
      client.close();
      isSyncingUser = false;
      notifyListeners();
    }
  }

  Future<void> _fetchLiveReferrals(List<String> uids) async {
    final List<Map<String, dynamic>> fetchedReferrals = [];
    double totalEarnings = 0.0;
    
    for (String uid in uids) {
      final client = HttpClient();
      try {
        final request = await client.postUrl(Uri.parse(
          'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents:runQuery'
        ));
        request.headers.contentType = ContentType.json;
        
        final queryBody = {
          'structuredQuery': {
            'from': [{'collectionId': 'users'}],
            'where': {
              'fieldFilter': {
                'field': {'fieldPath': 'referredBy'},
                'op': 'EQUAL',
                'value': {'stringValue': uid}
              }
            }
          }
        };
        
        request.write(jsonEncode(queryBody));
        final response = await request.close();
        
        if (response.statusCode == 200) {
          final responseBody = await response.transform(utf8.decoder).join();
          final List<dynamic> results = json.decode(responseBody);
          
          for (var result in results) {
            if (result['document'] != null) {
              final doc = result['document'];
              final fields = doc['fields'];
              final String docName = doc['name'] as String? ?? "";
              final String referredUid = docName.split('/').last;
              if (fields != null) {
                final String rName = _getString(fields['name'], "Arham Member");
                final String rDateRaw = _getString(fields['joinedDate'], _getString(fields['createdAt'], ""));
                
                String formattedDate = "Recently";
                if (rDateRaw.isNotEmpty) {
                  try {
                    final dt = DateTime.parse(rDateRaw);
                    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    formattedDate = "${dt.day} ${months[dt.month - 1]} ${dt.year}";
                  } catch (_) {}
                }
                
                // Avoid adding duplicate UIDs in case of multiple queries returning the same referred user
                bool alreadyAdded = fetchedReferrals.any((ref) => ref['uid'] == referredUid);
                if (!alreadyAdded) {
                  fetchedReferrals.add({
                    'uid': referredUid,
                    'name': rName,
                    'date': formattedDate,
                    'amount': 100.0,
                    'avatar': rName.isNotEmpty ? rName.substring(0, 1).toUpperCase() : 'A'
                  });
                  totalEarnings += 100.0;
                }
              }
            }
          }
        }
      } catch (e) {
        debugPrint("Error fetching live referrals for UID $uid: $e");
      } finally {
        client.close();
      }
    }
    
    referralsHistory = fetchedReferrals;
    successfulReferrals = fetchedReferrals.length;
    referralEarnings = totalEarnings;
    
    final List<Map<String, dynamic>> updatedTxHistory = [];
    if (hasSpunWheel) {
      updatedTxHistory.add({
        'title': 'Lucky Spin Wheel Reward',
        'date': 'Unlocked',
        'amount': 150.0,
        'type': 'spin'
      });
    }
    for (var ref in fetchedReferrals) {
      updatedTxHistory.add({
        'title': 'Referral Bonus - ${ref['name']}',
        'date': ref['date'],
        'amount': 100.0,
        'type': 'referral'
      });
    }
    transactionsHistory = updatedTxHistory;
    _syncToRegistry();
    notifyListeners();
  }

  Future<void> updateFirestoreUserFields(Map<String, Map<String, dynamic>> fieldsToUpdate) async {
    if (userUid == null || userUid!.isEmpty) return;
    final client = HttpClient();
    try {
      String queryParams = fieldsToUpdate.keys.map((k) => "updateMask.fieldPaths=$k").join("&");
      final request = await client.patchUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/users/$userUid?$queryParams'
      ));
      request.headers.contentType = ContentType.json;
      
      final body = {
        'fields': fieldsToUpdate
      };
      
      request.write(jsonEncode(body));
      final response = await request.close();
      if (response.statusCode == 200) {
        debugPrint("Successfully updated Firestore fields: ${fieldsToUpdate.keys}");
      }
    } catch (e) {
      debugPrint("Error updating Firestore fields: $e");
    } finally {
      client.close();
    }
  }

  Future<void> createFirestoreUser(String name, String email, String phone, String refCode) async {
    String cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(cleanPhone.length - 10);
    }
    if (cleanPhone.isEmpty) return;

    String safeName = name.trim().replaceAll(RegExp(r'\s+'), '');
    if (safeName.isEmpty) safeName = "USR";
    String namePrefix = safeName.length >= 3 ? safeName.substring(0, 3).toUpperCase() : safeName.toUpperCase().padRight(3, 'X');
    String randomSuffix = DateTime.now().millisecondsSinceEpoch.toString().substring(9);
    String generatedCode = "$namePrefix$randomSuffix";

    final client = HttpClient();
    try {
      String? referrerUid;
      if (refCode.isNotEmpty) {
        referrerUid = await _findUidByReferralCode(refCode);
      }

      final uid = "m_${DateTime.now().millisecondsSinceEpoch}_$cleanPhone";
      final request = await client.postUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/users?documentId=$uid'
      ));
      request.headers.contentType = ContentType.json;

      final userData = {
        'fields': {
          'name': {'stringValue': name},
          'email': {'stringValue': email},
          'phone': {'stringValue': cleanPhone},
          'walletBalance': {'integerValue': (referrerUid != null ? 100 : 0).toString()},
          'tier': {'stringValue': 'silver'},
          'points': {'integerValue': '450'},
          'joinedDate': {'stringValue': DateTime.now().toUtc().toIso8601String()},
          'referralCode': {'stringValue': generatedCode},
          'referredBy': referrerUid != null ? {'stringValue': referrerUid} : {'nullValue': null},
          'referralCount': {'integerValue': '0'},
        }
      };

      request.write(jsonEncode(userData));
      final response = await request.close();
      if (response.statusCode == 200) {
        userUid = uid;
        userReferralCode = generatedCode;
        if (referrerUid != null) {
          walletBalance = 100.0;
          await _creditReferrerOnFirestore(referrerUid, name);
        }
        _syncToRegistry();
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Error creating user document: $e");
    } finally {
      client.close();
    }
  }

  Future<String?> _findUidByReferralCode(String refCode) async {
    final client = HttpClient();
    try {
      final request = await client.postUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents:runQuery'
      ));
      request.headers.contentType = ContentType.json;
      
      final queryBody = {
        'structuredQuery': {
          'from': [{'collectionId': 'users'}],
          'where': {
            'fieldFilter': {
              'field': {'fieldPath': 'referralCode'},
              'op': 'EQUAL',
              'value': {'stringValue': refCode.trim().toUpperCase()}
            }
          },
          'limit': 1
        }
      };
      
      request.write(jsonEncode(queryBody));
      final response = await request.close();
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final List<dynamic> results = json.decode(responseBody);
        if (results.isNotEmpty && results[0]['document'] != null) {
          final docName = results[0]['document']['name'] as String;
          return docName.split('/').last;
        }
      }
    } catch (e) {
      debugPrint("Error validating referral code: $e");
    } finally {
      client.close();
    }
    return null;
  }

  Future<void> _creditReferrerOnFirestore(String referrerUid, String friendName) async {
    final client = HttpClient();
    try {
      final getRequest = await client.getUrl(Uri.parse(
        'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/users/$referrerUid'
      ));
      final getResponse = await getRequest.close();
      if (getResponse.statusCode == 200) {
        final getBody = await getResponse.transform(utf8.decoder).join();
        final Map<String, dynamic> data = json.decode(getBody);
        final fields = data['fields'];
        if (fields != null) {
          int currentWallet = 0;
          if (fields['walletBalance'] != null) {
            final wVal = fields['walletBalance'];
            currentWallet = int.tryParse(wVal['integerValue']?.toString() ?? wVal['stringValue']?.toString() ?? '0') ?? 0;
          }
          int currentRefCount = 0;
          if (fields['referralCount'] != null) {
            final rCountVal = fields['referralCount'];
            currentRefCount = int.tryParse(rCountVal['integerValue']?.toString() ?? '0') ?? 0;
          }

          final patchRequest = await client.patchUrl(Uri.parse(
            'https://firestore.googleapis.com/v1/projects/arham-ornaments-ee5f3/databases/(default)/documents/users/$referrerUid?updateMask.fieldPaths=walletBalance&updateMask.fieldPaths=referralCount'
          ));
          patchRequest.headers.contentType = ContentType.json;

          final patchBody = {
            'fields': {
              'walletBalance': {'integerValue': (currentWallet + 100).toString()},
              'referralCount': {'integerValue': (currentRefCount + 1).toString()},
            }
          };

          patchRequest.write(jsonEncode(patchBody));
          final patchResponse = await patchRequest.close();
          if (patchResponse.statusCode == 200) {
            debugPrint("Successfully credited referrer $referrerUid with bonus!");
          }
        }
      }
    } catch (e) {
      debugPrint("Error crediting referrer: $e");
    } finally {
      client.close();
    }
  }

  // Sign out user session
  void signOut() {
    isLoggedIn = false;
    userName = "Arham Guest";
    userEmail = "guest@arhamornaments.com";
    userPhone = "+91 9371504182";
    walletBalance = 0.0;
    referralEarnings = 0.0;
    successfulReferrals = 0;
    hasSpunWheel = false;
    appliedReferralCode = "";
    referralsHistory = [];
    transactionsHistory = [];
    userUid = null;
    _syncToRegistry();
    notifyListeners();
  }
}
