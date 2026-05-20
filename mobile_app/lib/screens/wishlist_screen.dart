import 'package:flutter/material.dart';
import '../models/product.dart';
import '../providers/store_provider.dart';
import '../widgets/product_detail_sheet.dart';

class WishlistScreen extends StatefulWidget {
  final StoreProvider provider;
  final Function(int) onTabChange;

  const WishlistScreen({
    super.key,
    required this.provider,
    required this.onTabChange,
  });

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  @override
  Widget build(BuildContext context) {
    final List<Product> wishlist = widget.provider.wishlistItems;

    return wishlist.isEmpty 
        ? _buildEmptyState() 
        : GridView.builder(
            padding: const EdgeInsets.all(12),
            physics: const ClampingScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.58,
            ),
            itemCount: wishlist.length,
            itemBuilder: (context, index) {
              final product = wishlist[index];
              final double price = widget.provider.getProductPrice(product);

              return GestureDetector(
                onTap: () => _showProductDetails(context, product),
                child: Container(
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
                      // Product Image & Remove Action
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                            child: Image.network(
                              product.imageUrl,
                              height: 190,
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
                              onTap: () => setState(() {
                                widget.provider.toggleWishlist(product);
                              }),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.close_rounded,
                                  color: Color(0xFFC5A059),
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
                                      fontSize: 13,
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
          );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: const BoxDecoration(
                color: Color(0xFFF9F6F0),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.favorite_border_rounded,
                size: 36,
                color: Color(0xFFC5A059),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Your Wishlist is Empty',
              style: TextStyle(
                color: Color(0xFF2C2C2C),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Browse through our handcrafted collections of antique gold kada, designer rings, and necklaces and save your favorites here!',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFF707070),
                fontSize: 13,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 28),
            GestureDetector(
              onTap: () => widget.onTabChange(1), // Go to Shop
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: const Text(
                  'EXPLORE COLLECTIONS',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Dynamic Product Details sheet (Reused for absolute structural consistency)
  void _showProductDetails(BuildContext context, Product initialProduct) {
    final List<Product> itemsList = widget.provider.wishlistItems;
    int initialIndex = itemsList.indexOf(initialProduct);
    if (initialIndex == -1) initialIndex = 0;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductDetailSheet(
          itemsList: itemsList,
          initialIndex: initialIndex,
          provider: widget.provider,
        ),
      ),
    ).then((_) {
      // Trigger setState on sheet close in case favorites were toggled
      setState(() {});
    });
  }
}
