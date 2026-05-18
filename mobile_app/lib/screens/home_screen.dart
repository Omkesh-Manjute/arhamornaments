import 'dart:async';
import 'package:flutter/material.dart';
import '../models/product.dart';
import '../providers/store_provider.dart';
import '../widgets/product_detail_sheet.dart';

class HomeScreen extends StatelessWidget {
  final StoreProvider provider;
  final Function(int) onTabChange; // Allows navigating to Shop tab directly
  final Function(String, {String? search, String? collection}) onCategorySelect; // Selects a category with optional search and collection

  const HomeScreen({
    super.key,
    required this.provider,
    required this.onTabChange,
    required this.onCategorySelect,
  });

  @override
  Widget build(BuildContext context) {
    final List<Product> bestSellers = provider.bestSellersProducts;
    final List<Product> newArrivals = provider.newArrivalsProducts;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Live Gold Rate Ticker Widget
          _buildLiveTicker(),

          // 2. Premium Auto-playing Sliding Hero Carousel
          _PremiumBannerCarousel(
            banners: provider.heroBanners,
            onTap: _handleNavigationLink,
          ),

          // 3. Category Circles Section
          _buildCategoriesSection(context),

          // 4. Shop by Occasion Grid
          _buildOccasionsSection(context),

          // 5. Shop by Gender Section
          _buildGendersSection(context),

          // 5.5. Interactive Three-Tier Promotional Banner Section
          _buildCollectionBannerSection(context),

          // 6. New Arrivals Scroll
          _buildHorizontalProductSection(
            context: context,
            title: 'New Arrivals',
            subtitle: 'HANDCRAFTED MODERN DESIGNS',
            products: newArrivals,
          ),

          const SizedBox(height: 12),

          // 7. Best Sellers Scroll
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

  // Interactive Three-Tier Promotional Banner Section (Men Collection, Woman Chain, Mangalsutra)
  Widget _buildCollectionBannerSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 28),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'LATEST TRENDS',
                style: TextStyle(
                  color: Color(0xFFC5A059),
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Featured Collections',
                style: TextStyle(
                  color: Color(0xFF2C2C2C),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: AspectRatio(
                aspectRatio: 682 / 1024,
                child: Stack(
                  children: [
                    // Main Banner Image
                    Image.asset(
                      'assets/collection_banner.jpg',
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                    ),
                    // Clickable Overlay Sections
                    Column(
                      children: [
                        // 1. Men Collection
                        Expanded(
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () => onCategorySelect('All', collection: "Men's Collection"),
                              splashColor: const Color(0x22C5A059),
                              highlightColor: const Color(0x11C5A059),
                              child: const SizedBox(
                                width: double.infinity,
                                height: double.infinity,
                              ),
                            ),
                          ),
                        ),
                        // 2. Woman Chain
                        Expanded(
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () => onCategorySelect('Chains', collection: "Women's Collection"),
                              splashColor: const Color(0x22C5A059),
                              highlightColor: const Color(0x11C5A059),
                              child: const SizedBox(
                                width: double.infinity,
                                height: double.infinity,
                              ),
                            ),
                          ),
                        ),
                        // 3. Mangalsutra
                        Expanded(
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () => onCategorySelect('Mangalsutras'),
                              splashColor: const Color(0x22C5A059),
                              highlightColor: const Color(0x11C5A059),
                              child: const SizedBox(
                                width: double.infinity,
                                height: double.infinity,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // Parses promotional and redirection links dynamically
  void _handleNavigationLink(String link) {
    if (link.isEmpty) return;
    
    final uri = Uri.tryParse(link);
    if (uri == null) return;
    
    String category = 'All';
    String? search;
    
    if (uri.queryParameters.containsKey('category')) {
      final String rawCat = uri.queryParameters['category'] ?? '';
      if (rawCat.toLowerCase().contains('neck')) {
        category = 'Necklaces';
      } else if (rawCat.toLowerCase().contains('bangle')) {
        category = 'Bangles';
      } else if (rawCat.toLowerCase().contains('ring')) {
        category = 'Rings';
      } else if (rawCat.toLowerCase().contains('mangal')) {
        category = 'Mangalsutras';
      } else if (rawCat.toLowerCase().contains('chain')) {
        category = 'Chains';
      } else if (rawCat.toLowerCase().contains('ear')) {
        category = 'Earrings';
      } else {
        category = rawCat;
      }
    }
    
    if (uri.queryParameters.containsKey('gender')) {
      search = uri.queryParameters['gender'];
    } else if (uri.queryParameters.containsKey('filter')) {
      search = uri.queryParameters['filter'];
    }
    
    onCategorySelect(category, search: search);
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

  // Categories Circles
  Widget _buildCategoriesSection(BuildContext context) {
    final List<Map<String, dynamic>> categories = [
      {'name': 'Bangles', 'icon': Icons.circle_outlined},
      {'name': 'Rings', 'icon': Icons.trip_origin_rounded},
      {'name': 'Necklaces', 'icon': Icons.filter_vintage_rounded},
      {'name': 'Mangalsutras', 'icon': Icons.favorite_rounded},
      {'name': 'Chains', 'icon': Icons.link_rounded},
      {'name': 'Earrings', 'icon': Icons.hearing_rounded},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
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

  // Shop by Occasion Grid Widget (2x2 Grid Group of 4)
  Widget _buildOccasionsSection(BuildContext context) {
    final List<Map<String, dynamic>> occasionsList = provider.occasions;
    if (occasionsList.isEmpty) return const SizedBox.shrink();

    // Take up to 4 occasions for the 2x2 grid
    final int displayCount = occasionsList.length > 4 ? 4 : occasionsList.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'DESIGNS FOR EVERY SPECIAL MOMENT',
                style: TextStyle(
                  color: Color(0xFFC5A059),
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Shop by Occasion',
                style: TextStyle(
                  color: Color(0xFF2C2C2C),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              // Row 1 (first 2 items)
              Row(
                children: [
                  if (displayCount > 0)
                    Expanded(
                      child: _buildOccasionGridItem(occasionsList[0]),
                    ),
                  if (displayCount > 1) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildOccasionGridItem(occasionsList[1]),
                    ),
                  ],
                ],
              ),
              if (displayCount > 2) ...[
                const SizedBox(height: 12),
                // Row 2 (next 2 items)
                Row(
                  children: [
                    Expanded(
                      child: _buildOccasionGridItem(occasionsList[2]),
                    ),
                    if (displayCount > 3) ...[
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildOccasionGridItem(occasionsList[3]),
                      ),
                    ] else
                      const Expanded(child: SizedBox.shrink()),
                  ],
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOccasionGridItem(Map<String, dynamic> occ) {
    final String name = occ['name'] ?? '';
    final String image = occ['image'] ?? '';
    final String path = occ['path'] ?? '';
    final String desc = occ['description'] ?? '';

    return GestureDetector(
      onTap: () => _handleNavigationLink(path),
      child: Container(
        height: 120, // Elegant premium height
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
          border: Border.all(
            color: const Color(0x1AC5A059),
            width: 1,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Background image
              Image.network(
                image,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: const Color(0xFFF9F6F0),
                    child: const Icon(Icons.celebration_rounded, color: Color(0xFFC5A059)),
                  );
                },
              ),
              // Soft elegant fade
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.black.withValues(alpha: 0.8),
                      Colors.black.withValues(alpha: 0.3),
                      Colors.transparent,
                    ],
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                  ),
                ),
              ),
              // Text Info
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      desc,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 9,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Shop by Gender Grid Widget
  Widget _buildGendersSection(BuildContext context) {
    final List<Map<String, dynamic>> gendersList = provider.genderSections;
    if (gendersList.isEmpty) return const SizedBox.shrink();

    // Separate Men, Kids, Women based on name
    final Map<String, dynamic> men = gendersList.firstWhere(
      (g) => (g['name'] ?? '').toLowerCase() == 'men',
      orElse: () => gendersList.isNotEmpty ? gendersList[0] : {},
    );
    final Map<String, dynamic> kids = gendersList.firstWhere(
      (g) => (g['name'] ?? '').toLowerCase() == 'kids',
      orElse: () => gendersList.length > 1 ? gendersList[1] : {},
    );
    final Map<String, dynamic> women = gendersList.firstWhere(
      (g) => (g['name'] ?? '').toLowerCase() == 'women',
      orElse: () => gendersList.length > 2 ? gendersList[2] : {},
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 28),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'CURATED COLLECTIONS',
                style: TextStyle(
                  color: Color(0xFFC5A059),
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Shop by Gender',
                style: TextStyle(
                  color: Color(0xFF2C2C2C),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              // Row of Men and Kids
              Row(
                children: [
                  if (men.isNotEmpty)
                    Expanded(
                      child: _buildGenderCard(
                        context: context,
                        name: men['name'] ?? 'Men',
                        image: men['image'] ?? '',
                        path: men['path'] ?? '',
                        height: 140,
                      ),
                    ),
                  if (men.isNotEmpty && kids.isNotEmpty)
                    const SizedBox(width: 12),
                  if (kids.isNotEmpty)
                    Expanded(
                      child: _buildGenderCard(
                        context: context,
                        name: kids['name'] ?? 'Kids',
                        image: kids['image'] ?? '',
                        path: kids['path'] ?? '',
                        height: 140,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              // Full-width Women card below
              if (women.isNotEmpty)
                _buildGenderCard(
                  context: context,
                  name: women['name'] ?? 'Women',
                  image: women['image'] ?? '',
                  path: women['path'] ?? '',
                  height: 150,
                  isFullWidth: true,
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGenderCard({
    required BuildContext context,
    required String name,
    required String image,
    required String path,
    required double height,
    bool isFullWidth = false,
  }) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
        border: Border.all(
          color: const Color(0x1AC5A059),
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(17),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background Image
            Image.network(
              image,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: const Color(0xFFF9F6F0),
                  child: const Icon(Icons.person_outline_rounded, color: Color(0xFFC5A059)),
                );
              },
            ),
            // Gradient Overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withValues(alpha: 0.75),
                    Colors.black.withValues(alpha: 0.2),
                    Colors.transparent,
                  ],
                  begin: Alignment.bottomLeft,
                  end: Alignment.topRight,
                ),
              ),
            ),
            // Overlay Text details
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'View Collection',
                        style: TextStyle(
                          color: Color(0xFFD4AF37),
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: const Color(0xFFD4AF37),
                        size: 11,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Premium InkWell overlay to make the ENTIRE card clickable with gold ripple
            Positioned.fill(
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    final String lowerName = name.toLowerCase();
                    if (lowerName.contains('women')) {
                      onCategorySelect('All', collection: "Women's Collection");
                    } else if (lowerName.contains('men')) {
                      onCategorySelect('All', collection: "Men's Collection");
                    } else if (lowerName.contains('kid')) {
                      onCategorySelect('All', collection: "Kids Collection");
                    } else {
                      _handleNavigationLink(path);
                    }
                    onTabChange(1); // Force transition to the Shop tab
                  },
                  splashColor: const Color(0x33C5A059),
                  highlightColor: const Color(0x11C5A059),
                ),
              ),
            ),
          ],
        ),
      ),
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
          height: 315, // Increased height to make products look larger and premium
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
                  width: 185, // Increased width from 160 to 185
                  margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
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
                              height: 190, // Increased image height from 170 to 190
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  height: 190,
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
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    product.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Color(0xFF2C2C2C),
                                      fontSize: 14, // Increased size for bold title
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFDFBF7),
                                    border: Border.all(color: const Color(0x33C5A059)),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    product.displayDesignNo,
                                    style: const TextStyle(
                                      color: Color(0xFFC5A059),
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${product.purity} • ${product.weight.toStringAsFixed(2)}g',
                              style: const TextStyle(
                                color: Color(0xFF707070),
                                fontSize: 11, // Increased size
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '₹${price.toStringAsFixed(0)}',
                              style: const TextStyle(
                                color: Color(0xFFC5A059),
                                fontSize: 14.5, // Increased price font size
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
  void _showProductDetails(BuildContext context, Product initialProduct) {
    final List<Product> itemsList = provider.products;
    int initialIndex = itemsList.indexOf(initialProduct);
    if (initialIndex == -1) initialIndex = 0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: false,
      builder: (context) => ProductDetailSheet(
        itemsList: itemsList,
        initialIndex: initialIndex,
        provider: provider,
      ),
    );
  }
}

// ---------------- Premium Banner Carousel Widget ----------------
class _PremiumBannerCarousel extends StatefulWidget {
  final List<Map<String, dynamic>> banners;
  final Function(String) onTap;

  const _PremiumBannerCarousel({
    required this.banners,
    required this.onTap,
  });

  @override
  State<_PremiumBannerCarousel> createState() => _PremiumBannerCarouselState();
}

class _PremiumBannerCarouselState extends State<_PremiumBannerCarousel> {
  late PageController _pageController;
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (widget.banners.isEmpty) return;
      int nextPage = _currentPage + 1;
      if (nextPage >= widget.banners.length) {
        nextPage = 0;
      }
      if (_pageController.hasClients) {
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      height: 200,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              onPageChanged: (page) {
                setState(() {
                  _currentPage = page;
                });
                _startTimer(); // Reset timer on manual swipe
              },
              itemCount: widget.banners.length,
              itemBuilder: (context, index) {
                final banner = widget.banners[index];
                final String imageUrl = banner['image'] ?? '';
                final String title = banner['title'] ?? '';
                final String subtitle = banner['subtitle'] ?? '';
                final String link = banner['link'] ?? '';

                return GestureDetector(
                  onTap: () => widget.onTap(link),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Full Background Image
                      Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Color(0xFF2C2C2C), Color(0xFF151515)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.image_outlined,
                                color: Color(0xFFC5A059),
                                size: 40,
                              ),
                            ),
                          );
                        },
                      ),
                      // Dark radial/linear gradient overlay for ultimate readability and glow
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.black.withValues(alpha: 0.75),
                              Colors.black.withValues(alpha: 0.3),
                              Colors.black.withValues(alpha: 0.1),
                            ],
                            begin: Alignment.bottomLeft,
                            end: Alignment.topRight,
                          ),
                        ),
                      ),
                      // Golden ornament brand design details (lines/curves)
                      Positioned(
                        right: -30,
                        bottom: -30,
                        child: Opacity(
                          opacity: 0.12,
                          child: Container(
                            width: 160,
                            height: 160,
                            decoration: BoxDecoration(
                              border: Border.all(color: const Color(0xFFC5A059), width: 1.5),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        right: -10,
                        bottom: -10,
                        child: Opacity(
                          opacity: 0.08,
                          child: Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              border: Border.all(color: const Color(0xFFC5A059), width: 1.5),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ),
                      // Content
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFC5A059).withValues(alpha: 0.15),
                                border: Border.all(color: const Color(0xFFC5A059), width: 1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                title.toUpperCase(),
                                style: const TextStyle(
                                  color: Color(0xFFD4AF37),
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.8,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              subtitle,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 19,
                                fontWeight: FontWeight.bold,
                                height: 1.2,
                                shadows: [
                                  Shadow(
                                    color: Colors.black45,
                                    offset: Offset(0, 2),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Text(
                                  'Explore Collection',
                                  style: TextStyle(
                                    color: Color(0xFFC5A059),
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.arrow_forward_rounded,
                                  color: Color(0xFFC5A059),
                                  size: 11,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            // Custom Gold Indicator Dots
            Positioned(
              bottom: 12,
              right: 20,
              child: Row(
                children: List.generate(
                  widget.banners.length,
                  (index) => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: _currentPage == index ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: _currentPage == index
                          ? const Color(0xFFC5A059)
                          : const Color(0xFFE5E7EB).withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
