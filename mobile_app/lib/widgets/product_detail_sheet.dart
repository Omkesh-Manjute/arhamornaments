import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/product.dart';
import '../providers/store_provider.dart';
import '../widgets/arham_app_bar.dart';
import 'custom_logo_loader.dart';
import '../screens/wishlist_screen.dart';

class ProductDetailSheet extends StatefulWidget {
  final List<Product> itemsList;
  final int initialIndex;
  final StoreProvider provider;

  const ProductDetailSheet({
    super.key,
    required this.itemsList,
    required this.initialIndex,
    required this.provider,
  });

  @override
  State<ProductDetailSheet> createState() => _ProductDetailSheetState();
}

class _ProductDetailSheetState extends State<ProductDetailSheet> {
  late PageController _pageController;
  late int _currentIndex;
  bool _isDetailsLoading = true;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
    
    // Simulate premium details load for 800 milliseconds
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          _isDetailsLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _openWishlist(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          backgroundColor: const Color(0xFFFCFAF6),
          appBar: ArhamAppBar(
            provider: widget.provider,
            showHamburger: false,
            onWishlistTap: null, // already on wishlist, disable
          ),
          body: WishlistScreen(
            provider: widget.provider,
            onTabChange: (index) {
              Navigator.popUntil(context, (route) => route.isFirst);
            },
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.itemsList.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: ArhamAppBar(
          provider: widget.provider,
          showHamburger: false,
          onWishlistTap: () => _openWishlist(context),
        ),
        body: const Center(child: Text('No products available')),
      );
    }

    // Safely bounds-check current index
    if (_currentIndex >= widget.itemsList.length) {
      _currentIndex = widget.itemsList.length - 1;
    }
    if (_currentIndex < 0) {
      _currentIndex = 0;
    }

    final currentProduct = widget.itemsList[_currentIndex];

    if (_isDetailsLoading) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: ArhamAppBar(
          provider: widget.provider,
          showHamburger: false,
          onWishlistTap: () => _openWishlist(context),
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CustomLogoLoader(size: 85),
              SizedBox(height: 18),
              Text(
                'RETRIEVING SPECIFICATIONS',
                style: TextStyle(
                  color: Color(0xFFC5A059),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2.0,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: ArhamAppBar(
        provider: widget.provider,
        showHamburger: false,
        onWishlistTap: () => _openWishlist(context),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Scrollable content area containing the PageView
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.zero,
              child: Stack(
                children: [
                  // Horizontal PageView of all products
                  PageView.builder(
                    controller: _pageController,
                    itemCount: widget.itemsList.length,
                    onPageChanged: (index) {
                      setState(() {
                        _currentIndex = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      final product = widget.itemsList[index];
                      return _buildProductContent(product);
                    },
                  ),
                ],
              ),
            ),
          ),

          // Fixed / Sticky bottom actions bar matching safety rules
          _buildStickyBottomBar(currentProduct),
        ],
      ),
    );
  }

  // Individual scrollable product sheet content
  Widget _buildProductContent(Product product) {
    final double price = widget.provider.getProductPrice(product);
    final double makingCharge = price * 0.12;
    final double gst = price * 0.03;
    final bool isSaved = widget.provider.isWishlisted(product.id);

    // Calculate hero image height based on screen size for maximum impact
    final double screenHeight = MediaQuery.of(context).size.height;
    final double heroImageHeight = screenHeight * 0.48; // ~48% of screen height for large, prominent images

    return MediaQuery.removePadding(
      context: context,
      removeTop: true,
      child: SingleChildScrollView(
        physics: const ClampingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          // Main product hero image stack starting directly at the top
          Stack(
            children: [
              Image.network(
                product.imageUrl,
                width: double.infinity,
                height: heroImageHeight,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: heroImageHeight,
                    color: const Color(0xFFF9F6F0),
                    child: const Icon(Icons.image_outlined, size: 48, color: Color(0xFFC5A059)),
                  );
                },
              ),
              // Soft gradient at the top of the image to ensure the floating bar is always visible
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.25),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              // Previous product navigation arrow — clean gold icon with subtle shadow
              Positioned(
                left: 14,
                top: (heroImageHeight / 2) - 20,
                child: GestureDetector(
                  onTap: () {
                    if (_currentIndex > 0) {
                      _pageController.previousPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      _pageController.animateToPage(
                        widget.itemsList.length - 1,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    }
                  },
                  behavior: HitTestBehavior.opaque,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Icon(
                      Icons.arrow_back_ios_new_rounded,
                      color: const Color(0xFFC5A059),
                      size: 26,
                      shadows: [
                        Shadow(
                          color: Colors.black.withValues(alpha: 0.45),
                          blurRadius: 8,
                          offset: const Offset(0, 1),
                        ),
                        Shadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              // Next product navigation arrow — clean gold icon with subtle shadow
              Positioned(
                right: 14,
                top: (heroImageHeight / 2) - 20,
                child: GestureDetector(
                  onTap: () {
                    if (_currentIndex < widget.itemsList.length - 1) {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      _pageController.animateToPage(
                        0,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    }
                  },
                  behavior: HitTestBehavior.opaque,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Icon(
                      Icons.arrow_forward_ios_rounded,
                      color: const Color(0xFFC5A059),
                      size: 26,
                      shadows: [
                        Shadow(
                          color: Colors.black.withValues(alpha: 0.45),
                          blurRadius: 8,
                          offset: const Offset(0, 1),
                        ),
                        Shadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
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

                // Dynamic pricing breakdown
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
                _buildSpecRow('Design Number', product.displayDesignNo),
                const SizedBox(height: 20),

                const Text('Description', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                Text(
                  product.description,
                  style: const TextStyle(color: Color(0xFF707070), height: 1.5, fontSize: 13),
                ),
                const SizedBox(height: 20),
                
                // Quick Enquiry
                const Text('Quick Inquiry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildActionItem(
                      icon: Icons.phone_in_talk_rounded,
                      label: 'Call',
                      backgroundColor: const Color(0xFFFFF4EB),
                      iconColor: const Color(0xFFE67E22),
                      onTap: () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final Uri url = Uri.parse('tel:+919371504182');
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        } else {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Could not initiate inquiry call.')),
                          );
                        }
                      },
                    ),
                    _buildActionItem(
                      icon: isSaved ? Icons.favorite_rounded : Icons.favorite_outline_rounded,
                      label: 'Favorite',
                      backgroundColor: const Color(0xFFFFEBF0),
                      iconColor: const Color(0xFFE74C3C),
                      onTap: () {
                        widget.provider.toggleWishlist(product);
                        setState(() {});
                      },
                    ),
                    _buildActionItem(
                      icon: Icons.chat_bubble_outline_rounded,
                      label: 'WhatsApp',
                      backgroundColor: const Color(0xFFEBFBEF),
                      iconColor: const Color(0xFF2ECC71),
                      onTap: () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final String message = "Hello! I am interested in inquiring about your product: ${product.name} (Weight: ${product.weight}g, Category: ${product.category}, Price: ₹${price.toStringAsFixed(0)}). Can you share more details?";
                        final Uri url = Uri.parse("https://wa.me/919371504182?text=${Uri.encodeComponent(message)}");
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url, mode: LaunchMode.externalApplication);
                        } else {
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Could not open WhatsApp.')),
                          );
                        }
                      },
                    ),
                    _buildActionItem(
                      icon: Icons.share_rounded,
                      label: 'Share',
                      backgroundColor: const Color(0xFFEBF5FB),
                      iconColor: const Color(0xFF3498DB),
                      onTap: () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final String shareText = "Check out this beautiful design from Omkesh Jewelry!\n\nProduct: ${product.name}\nWeight: ${product.weight}g\nCategory: ${product.category}\nEstimated Price: ₹${price.toStringAsFixed(0)}\nImage: ${product.imageUrl}";
                        await Clipboard.setData(ClipboardData(text: shareText));
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('Inquiry details copied to clipboard!'),
                            backgroundColor: Color(0xFF3498DB),
                          ),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

  // Fixed / Sticky bottom bar with Safe Area elevations
  Widget _buildStickyBottomBar(Product product) {
    final bool isSaved = widget.provider.isWishlisted(product.id);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 14,
            bottom: MediaQuery.of(context).padding.bottom > 0 ? 12 : 24,
          ),
          child: Row(
            children: [
              GestureDetector(
                onTap: () {
                  widget.provider.toggleWishlist(product);
                  setState(() {});
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
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    widget.provider.addToCart(product);
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
      ),
    );
  }

  // Quick inquiry action circular icon item
  Widget _buildActionItem({
    required IconData icon,
    required String label,
    required Color backgroundColor,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            height: 52,
            width: 52,
            decoration: BoxDecoration(
              color: backgroundColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF555555),
            ),
          ),
        ],
      ),
    );
  }

  // Specification row helper
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
