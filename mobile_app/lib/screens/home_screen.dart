import 'package:flutter/material.dart';
import '../models/product.dart';
import '../providers/store_provider.dart';

class HomeScreen extends StatelessWidget {
  final StoreProvider provider;
  final Function(int) onTabChange; // Allows navigating to Shop tab directly
  final Function(String) onCategorySelect; // Selects a category

  const HomeScreen({
    super.key,
    required this.provider,
    required this.onTabChange,
    required this.onCategorySelect,
  });

  @override
  Widget build(BuildContext context) {
    final List<Product> bestSellers = mockProducts.where((p) => p.isBestSeller).toList();
    final List<Product> newArrivals = mockProducts.where((p) => p.isNewArrival).toList();

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Live Gold Rate Ticker Widget
          _buildLiveTicker(),

          // 2. Premium Branding Banner
          _buildHeroBanner(),

          // 3. Category Circles Section
          _buildCategoriesSection(context),

          // 4. New Arrivals Scroll
          _buildHorizontalProductSection(
            context: context,
            title: 'New Arrivals',
            subtitle: 'HANDCRAFTED MODERN DESIGNS',
            products: newArrivals,
          ),

          const SizedBox(height: 12),

          // 5. Best Sellers Scroll
          _buildHorizontalProductSection(
            context: context,
            title: 'Best Sellers',
            subtitle: 'TIMELESS CLASSICS YOU LOVE',
            products: bestSellers,
          ),

          const SizedBox(height: 36),
        ],
      ),
    );
  }

  // Live Price Ticker
  Widget _buildLiveTicker() {
    return Container(
      width: double.infinity,
      color: const Color(0xFF1C1C1C), // Rich charcoal/black
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFD4AF37),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'LIVE RATE',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(width: 12),
            _buildTickerItem('22KT Gold', provider.gold22Rate),
            _buildDivider(),
            _buildTickerItem('24KT Gold', provider.gold24Rate),
            _buildDivider(),
            _buildTickerItem('Silver', provider.silverRate, isGold: false),
          ],
        ),
      ),
    );
  }

  Widget _buildTickerItem(String name, double price, {bool isGold = true}) {
    return Row(
      children: [
        Text(
          '$name: ',
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          '₹${price.toStringAsFixed(0)}/g',
          style: TextStyle(
            color: isGold ? const Color(0xFFD4AF37) : const Color(0xFFE0E0E0),
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Text(
        '•',
        style: TextStyle(color: Colors.white38),
      ),
    );
  }

  // Hero Image Banner
  Widget _buildHeroBanner() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0x1AC5A059),
            blurRadius: 16,
            spreadRadius: 2,
            offset: const Offset(0, 8),
          ),
        ],
        gradient: const LinearGradient(
          colors: [Color(0xFF2C2C2C), Color(0xFF151515)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          // Gold abstract pattern shapes
          Positioned(
            right: -50,
            bottom: -50,
            child: Opacity(
              opacity: 0.15,
              child: Container(
                width: 200,
                height: 200,
                decoration: const BoxDecoration(
                  color: Color(0xFFC5A059),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFC5A059)),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'EXCLUSIVE FESTIVE OFFER',
                    style: TextStyle(
                      color: Color(0xFFC5A059),
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Handcrafted Pure Gold\n& Antique Masterpieces',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Flat ₹1000 Wallet Discount + Zero making charge on first buy!',
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Categories Circles
  Widget _buildCategoriesSection(BuildContext context) {
    final List<Map<String, dynamic>> categories = [
      {'name': 'Bangles', 'icon': Icons.circle_outlined},
      {'name': 'Rings', 'icon': Icons.trip_origin_rounded},
      {'name': 'Necklaces', 'icon': Icons.filter_vintage_rounded},
      {'name': 'Mangalsutras', 'icon': Icons.favorite_rounded},
      {'name': 'Chains', 'icon': Icons.link_rounded},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Browse Categories',
            style: TextStyle(
              color: Color(0xFF2C2C2C),
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 96,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: categories.length,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemBuilder: (context, index) {
              final cat = categories[index];
              return GestureDetector(
                onTap: () {
                  onCategorySelect(cat['name']);
                  onTabChange(1); // Jump to Shop tab
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    children: [
                      Container(
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF9F6F0),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0x33C5A059),
                            width: 1.5,
                          ),
                        ),
                        child: Center(
                          child: Icon(
                            cat['icon'],
                            color: const Color(0xFFC5A059),
                            size: 24,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cat['name'],
                        style: const TextStyle(
                          color: Color(0xFF555555),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // Horizontal Product Grid
  Widget _buildHorizontalProductSection({
    required BuildContext context,
    required String title,
    required String subtitle,
    required List<Product> products,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                subtitle,
                style: const TextStyle(
                  color: Color(0xFFC5A059),
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Color(0xFF2C2C2C),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      onCategorySelect('All');
                      onTabChange(1); // Go to shop
                    },
                    child: const Row(
                      children: [
                        Text(
                          'View All',
                          style: TextStyle(
                            color: Color(0xFFC5A059),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Icon(
                          Icons.chevron_right_rounded,
                          color: Color(0xFFC5A059),
                          size: 16,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        SizedBox(
          height: 250,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: products.length,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemBuilder: (context, index) {
              final product = products[index];
              final double price = provider.getProductPrice(product);
              final bool isWishlisted = provider.isWishlisted(product.id);

              return GestureDetector(
                onTap: () => _showProductDetails(context, product),
                child: Container(
                  width: 160,
                  margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product Image & Wishlist Button
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                            child: Image.network(
                              product.imageUrl,
                              height: 140,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  height: 140,
                                  color: const Color(0xFFF9F6F0),
                                  child: const Icon(Icons.image_outlined, color: Color(0xFFC5A059)),
                                );
                              },
                            ),
                          ),
                          Positioned(
                            top: 8,
                            right: 8,
                            child: GestureDetector(
                              onTap: () => provider.toggleWishlist(product),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  isWishlisted ? Icons.favorite_rounded : Icons.favorite_outline_rounded,
                                  color: isWishlisted ? Colors.red : const Color(0xFFC5A059),
                                  size: 16,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Color(0xFF2C2C2C),
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${product.purity} • ${product.weight.toStringAsFixed(2)}g',
                              style: const TextStyle(
                                color: Color(0xFF707070),
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '₹${price.toStringAsFixed(0)}',
                              style: const TextStyle(
                                color: Color(0xFFC5A059),
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // Dynamic Product Details Native Bottom Sheet
  void _showProductDetails(BuildContext context, Product product) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final double price = provider.getProductPrice(product);
        final makingCharge = price * 0.12;
        final gst = price * 0.03;

        return StatefulBuilder(
          builder: (context, setState) {
            final isSaved = provider.isWishlisted(product.id);
            return Container(
              height: MediaQuery.of(context).size.height * 0.85,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Elegant drag bar
                  Center(
                    child: Container(
                      width: 40,
                      height: 5,
                      margin: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.black12,
                        borderRadius: BorderRadius.circular(2.5),
                      ),
                    ),
                  ),

                  Expanded(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Large Image
                          Image.network(
                            product.imageUrl,
                            width: double.infinity,
                            height: 280,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                height: 280,
                                color: const Color(0xFFF9F6F0),
                                child: const Icon(Icons.image_outlined, size: 48, color: Color(0xFFC5A059)),
                              );
                            },
                          ),

                          Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            product.category.toUpperCase(),
                                            style: const TextStyle(
                                              color: Color(0xFFC5A059),
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 1.5,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            product.name,
                                            style: const TextStyle(
                                              color: Color(0xFF2C2C2C),
                                              fontSize: 22,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFDFBF7),
                                        border: Border.all(color: const Color(0xFFC5A059)),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        product.purity,
                                        style: const TextStyle(
                                          color: Color(0xFFC5A059),
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),

                                // Price Details Block
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF9F9F9),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Column(
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('Gold Value (estimated)', style: TextStyle(color: Color(0xFF707070))),
                                          Text('₹${(price - makingCharge - gst).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('Making Charges (12%)', style: TextStyle(color: Color(0xFF707070))),
                                          Text('₹${makingCharge.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('GST (3%)', style: TextStyle(color: Color(0xFF707070))),
                                          Text('₹${gst.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                                        ],
                                      ),
                                      const Padding(
                                        padding: EdgeInsets.symmetric(vertical: 12),
                                        child: Divider(height: 1),
                                      ),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('ESTIMATED PRICE', style: TextStyle(color: Color(0xFF2C2C2C), fontWeight: FontWeight.bold)),
                                          Text(
                                            '₹${price.toStringAsFixed(0)}',
                                            style: const TextStyle(
                                              color: Color(0xFFC5A059),
                                              fontSize: 18,
                                              fontWeight: FontWeight.w800,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 20),

                                // Specifications list
                                const Text('Specifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                const SizedBox(height: 8),
                                _buildSpecRow('Net Weight', '${product.weight.toStringAsFixed(2)} grams'),
                                _buildSpecRow('Gold Purity', product.purity),
                                _buildSpecRow('Jewellery Type', product.category),
                                const SizedBox(height: 20),

                                const Text('Description', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                const SizedBox(height: 8),
                                Text(
                                  product.description,
                                  style: const TextStyle(color: Color(0xFF707070), height: 1.5, fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Bottom Action Buttons
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        // Save / Wishlist
                        GestureDetector(
                          onTap: () {
                            provider.toggleWishlist(product);
                            setState(() {}); // Redraw sheet state
                          },
                          child: Container(
                            height: 54,
                            width: 54,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF9F6F0),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0x33C5A059)),
                            ),
                            child: Icon(
                              isSaved ? Icons.favorite_rounded : Icons.favorite_outline_rounded,
                              color: isSaved ? Colors.red : const Color(0xFFC5A059),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Add To Cart
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              provider.addToCart(product);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('${product.name} added to cart!'),
                                  backgroundColor: const Color(0xFFC5A059),
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            },
                            child: Container(
                              height: 54,
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Center(
                                child: Text(
                                  'ADD TO BASKET',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF707070), fontSize: 13)),
          Text(value, style: const TextStyle(color: Color(0xFF2C2C2C), fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }
}
