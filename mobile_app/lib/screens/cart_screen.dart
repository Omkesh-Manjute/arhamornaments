import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/store_provider.dart';

class CartScreen extends StatefulWidget {
  final StoreProvider provider;
  final Function(int) onTabChange;

  const CartScreen({
    super.key,
    required this.provider,
    required this.onTabChange,
  });

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final TextEditingController _couponController = TextEditingController();

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  // Build the clean order summary text (no image URLs)
  String _buildOrderText() {
    final provider = widget.provider;
    final buffer = StringBuffer();

    buffer.writeln("✨ *NEW ORDER: ARHAM ORNAMENTS* ✨\n");
    buffer.writeln("Hello Arham Ornaments, I would like to place an order for the following custom gold jewelry design(s):\n");
    buffer.writeln("--------------------------------");

    for (var item in provider.cartItems) {
      final qty = provider.getProductQuantity(item.id);
      final price = provider.getProductPrice(item);

      buffer.writeln("🛍️ *${item.name}*");
      buffer.writeln("  • Design No: ${item.displayDesignNo}");
      buffer.writeln("  • Purity: ${item.purity}");
      buffer.writeln("  • Weight: ${item.weight.toStringAsFixed(2)} grams");
      buffer.writeln("  • Quantity: $qty");
      buffer.writeln("  • Price: ₹${price.toStringAsFixed(0)} each");
      buffer.writeln("  • Subtotal: ₹${(price * qty).toStringAsFixed(0)}");
      buffer.writeln("--------------------------------");
    }

    buffer.writeln("💳 *BILL DETAILS (ESTIMATED):*");
    buffer.writeln("  • Basket Subtotal: ₹${provider.subtotal.toStringAsFixed(0)}");

    if (provider.isWalletRedeemed) {
      buffer.writeln("  • Referral Wallet Applied: -₹${provider.walletDiscount.toStringAsFixed(0)}");
    }
    if (provider.activeCouponCode != null) {
      buffer.writeln("  • Coupon Discount (${provider.activeCouponCode}): -₹${provider.couponDiscountAmount.toStringAsFixed(0)}");
    }

    buffer.writeln("  • *GRAND TOTAL: ₹${provider.grandTotal.toStringAsFixed(0)}*");
    buffer.writeln("--------------------------------");

    buffer.writeln("👤 *CUSTOMER DETAILS:*");
    buffer.writeln("  • Name: ${provider.userName}${provider.isLoggedIn ? "" : " (Guest)"}");
    if (provider.isLoggedIn) {
      buffer.writeln("  • Phone: ${provider.userPhone}");
      if (provider.userEmail.isNotEmpty && provider.userEmail != "guest@arhamornaments.com") {
        buffer.writeln("  • Email: ${provider.userEmail}");
      }
    }
    buffer.writeln("--------------------------------");
    buffer.writeln("\nPlease review my order. Let me know the shipping timeline and payment steps. Thank you!");

    return buffer.toString();
  }

  // Place order directly to the store owner's WhatsApp — no share sheet
  void _placeWhatsAppOrder() async {
    const String phone = "919371504182";
    final provider = widget.provider;
    final String orderText = _buildOrderText();

    // Deduct wallet before launching
    double walletDiscountUsed = 0.0;
    if (provider.isWalletRedeemed) {
      walletDiscountUsed = provider.walletDiscount;
    }

    try {
      final String encoded = Uri.encodeComponent(orderText);
      final Uri whatsappUrl = Uri.parse("https://wa.me/$phone?text=$encoded");

      if (await canLaunchUrl(whatsappUrl)) {
        if (walletDiscountUsed > 0) {
          provider.deductWallet(walletDiscountUsed);
        }
        await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
      } else {
        // WhatsApp is not installed
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('WhatsApp is not installed. Please install WhatsApp to place your order.'),
              backgroundColor: Colors.redAccent,
              duration: Duration(seconds: 4),
            ),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not open WhatsApp. Please contact +91 93715 04182 directly.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = widget.provider;

    return provider.cartItems.isEmpty 
        ? _buildEmptyState() 
        : SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. Premium Product Cards List
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  itemCount: provider.cartItems.length,
                  itemBuilder: (context, index) {
                    final item = provider.cartItems[index];
                    final qty = provider.getProductQuantity(item.id);
                    final price = provider.getProductPrice(item);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFF0EAE1)), // Premium fine light gold border
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(10),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Thumbnail Image (Larger 110 x 120px)
                          ClipRRect(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(15),
                              bottomLeft: Radius.circular(15),
                            ),
                            child: Image.network(
                              item.imageUrl,
                              width: 110,
                              height: 120,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  width: 110,
                                  height: 120,
                                  color: const Color(0xFFF9F6F0),
                                  child: const Icon(Icons.image_outlined, color: Color(0xFFC5A059), size: 28),
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 12),

                          // Text Info
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(top: 10, bottom: 10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Color(0xFF2C2C2C),
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  // Design Number Badge
                                  Text(
                                    'Design No: ${item.displayDesignNo}',
                                    style: const TextStyle(
                                      color: Color(0xFFC5A059),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  // Metal Purity & Weight
                                  Text(
                                    '${item.purity} • ${item.weight.toStringAsFixed(2)} grams',
                                    style: const TextStyle(
                                      color: Color(0xFF707070),
                                      fontSize: 11,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  // Estimated Price
                                  Text(
                                    'Est: ₹${(price * qty).toStringAsFixed(0)}',
                                    style: const TextStyle(
                                      color: Color(0xFFC5A059),
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Right Side Action Column (Quantity selector and Remove option)
                          Padding(
                            padding: const EdgeInsets.only(right: 12, top: 12, bottom: 10),
                            child: SizedBox(
                              height: 96,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  // Quantity Picker
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      // Minus
                                      GestureDetector(
                                        onTap: () => provider.decreaseQuantity(item),
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF9F6F0),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Icon(Icons.remove_rounded, size: 16, color: Color(0xFFC5A059)),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        '$qty',
                                        style: const TextStyle(
                                          color: Color(0xFF2C2C2C),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      // Plus
                                      GestureDetector(
                                        onTap: () => provider.addToCart(item),
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF9F6F0),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Icon(Icons.add_rounded, size: 16, color: Color(0xFFC5A059)),
                                        ),
                                      ),
                                    ],
                                  ),
                                  // Remove action
                                  GestureDetector(
                                    onTap: () => provider.removeFromCart(item),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      child: const Text(
                                        'Remove',
                                        style: TextStyle(
                                          color: Colors.redAccent,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),

                // 2. Referral Wallet Redemption Switch Card
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(5),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: Color(0xFFFDFBF7),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.account_balance_wallet_outlined, color: Color(0xFFC5A059)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Referral Rewards Balance',
                              style: TextStyle(
                                color: Color(0xFF2C2C2C),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Available: ₹${provider.walletBalance.toStringAsFixed(0)} (Redeem up to ₹1,000)',
                              style: const TextStyle(
                                color: Color(0xFF707070),
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Switch.adaptive(
                        value: provider.isWalletRedeemed,
                        activeTrackColor: const Color(0xFFC5A059),
                        onChanged: provider.walletBalance > 0
                          ? (value) => provider.toggleWalletRedemption(value)
                          : null,
                      ),
                    ],
                  ),
                ),

                // 3. Dynamic Promo Coupon Card
                if (provider.hasAnyValidCoupon || provider.activeCouponCode != null)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(5),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.confirmation_number_outlined, color: Color(0xFFC5A059), size: 20),
                            const SizedBox(width: 8),
                            Text(
                              provider.activeCouponCode != null 
                                  ? 'Applied: ${provider.activeCouponCode}' 
                                  : 'Have a Promo Coupon Code?',
                              style: const TextStyle(
                                color: Color(0xFF2C2C2C),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Spacer(),
                            if (provider.activeCouponCode != null)
                              GestureDetector(
                                onTap: () {
                                  provider.removeCoupon();
                                  _couponController.clear();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Coupon code removed!')),
                                  );
                                },
                                child: const Text(
                                  'REMOVE',
                                  style: TextStyle(
                                    color: Colors.redAccent,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        if (provider.activeCouponCode == null) ...[
                          Row(
                            children: [
                              Expanded(
                                child: SizedBox(
                                  height: 42,
                                  child: TextField(
                                    controller: _couponController,
                                    textCapitalization: TextCapitalization.characters,
                                    decoration: InputDecoration(
                                      hintText: 'Enter code (e.g. ARHAM20, WELCOME10)',
                                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFFB0B0B0)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(10),
                                        borderSide: const BorderSide(color: Color(0xFFC5A059)),
                                      ),
                                    ),
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              GestureDetector(
                                onTap: () {
                                  final code = _couponController.text.trim();
                                  if (code.isEmpty) return;
                                  final errorMsg = provider.applyCoupon(code);
                                  if (errorMsg == null) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Coupon "$code" applied successfully!'),
                                        backgroundColor: const Color(0xFFC5A059),
                                      ),
                                    );
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(errorMsg),
                                        backgroundColor: Colors.redAccent,
                                      ),
                                    );
                                  }
                                },
                                child: Container(
                                  height: 42,
                                  padding: const EdgeInsets.symmetric(horizontal: 16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFC5A059),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'APPLY',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          
                          // Available Valid Coupons Suggestion Row
                          Builder(
                            builder: (context) {
                              final List<Map<String, dynamic>> applicableCoupons = provider.adminCoupons.where((c) {
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

                                final double minAmount = (c['minOrderAmount'] as num?)?.toDouble() ?? 0.0;
                                if (provider.subtotal < minAmount) return false;

                                final int? limit = c['usageLimit'];
                                final int count = c['usageCount'] ?? 0;
                                if (limit != null && count >= limit) return false;

                                return true;
                              }).toList();

                              if (applicableCoupons.isEmpty) {
                                return const SizedBox.shrink();
                              }

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 12),
                                  const Text(
                                    'Available Coupons:',
                                    style: TextStyle(
                                      color: Color(0xFF707070),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  SizedBox(
                                    height: 38,
                                    child: ListView.builder(
                                      scrollDirection: Axis.horizontal,
                                      itemCount: applicableCoupons.length,
                                      itemBuilder: (context, idx) {
                                        final coupon = applicableCoupons[idx];
                                        final code = coupon['code'] ?? '';
                                        final type = coupon['discountType'] ?? 'fixed';
                                        final val = (coupon['discountValue'] as num?)?.toDouble() ?? 0.0;
                                        final discountText = type == 'percentage'
                                            ? '${val.toInt()}% OFF'
                                            : '₹${val.toInt()} OFF';

                                        return GestureDetector(
                                          onTap: () {
                                            _couponController.text = code;
                                            final errorMsg = provider.applyCoupon(code);
                                            if (errorMsg == null) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text('Coupon "$code" applied successfully!'),
                                                  backgroundColor: const Color(0xFFC5A059),
                                                ),
                                              );
                                            } else {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(
                                                  content: Text(errorMsg),
                                                  backgroundColor: Colors.redAccent,
                                                ),
                                              );
                                            }
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.only(right: 8),
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFFFDF9),
                                              borderRadius: BorderRadius.circular(20),
                                              border: Border.all(
                                                color: const Color(0xFFC5A059).withAlpha(77),
                                                width: 1,
                                              ),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(Icons.local_offer_outlined, color: Color(0xFFC5A059), size: 14),
                                                const SizedBox(width: 6),
                                                Text(
                                                  '$code – $discountText',
                                                  style: const TextStyle(
                                                    color: Color(0xFFC5A059),
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 11,
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
                            },
                          ),
                        ] else ...[
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFDF9),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFE5D5B5)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Colors.green, size: 16),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    provider.couponDiscountPercentage > 0
                                        ? '${(provider.couponDiscountPercentage * 100).toInt()}% discount active on this order!'
                                        : '₹${provider.couponDiscountAmount.toStringAsFixed(0)} discount active on this order!',
                                    style: const TextStyle(color: Color(0xFF705010), fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                // 4. Elegant Transaction Invoice Summary
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9F9F9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Items Subtotal', style: TextStyle(color: Color(0xFF707070), fontSize: 13)),
                          Text('₹${provider.subtotal.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      if (provider.isWalletRedeemed && provider.walletDiscount > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Wallet Discount', style: TextStyle(color: Color(0xFF707070), fontSize: 13)),
                            Text('-₹${provider.walletDiscount.toStringAsFixed(0)}', style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                      ],
                      if (provider.activeCouponCode != null && provider.couponDiscountAmount > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              provider.couponDiscountPercentage > 0
                                  ? 'Coupon Discount (${provider.activeCouponCode} ${(provider.couponDiscountPercentage * 100).toInt()}%)'
                                  : 'Coupon Discount (${provider.activeCouponCode})',
                              style: const TextStyle(color: Color(0xFF707070), fontSize: 13),
                            ),
                            Text('-₹${provider.couponDiscountAmount.toStringAsFixed(0)}', style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                      ],
                      const SizedBox(height: 8),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Making Charges & GST', style: TextStyle(color: Color(0xFF707070), fontSize: 13)),
                          Text('Included', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Divider(height: 1),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('GRAND TOTAL (Estimated)', style: TextStyle(color: Color(0xFF2C2C2C), fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(
                            '₹${provider.grandTotal.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: Color(0xFFC5A059),
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Dispatch Button
                      GestureDetector(
                        onTap: _placeWhatsAppOrder,
                        child: Container(
                          height: 50,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF25D366), Color(0xFF128C7E)], // Iconic WhatsApp Green gradient
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0x3325D366),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.chat_bubble_outline_rounded, color: Colors.white, size: 20),
                              SizedBox(width: 10),
                              Text(
                                'PLACE ORDER VIA WHATSAPP',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
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
                Icons.shopping_bag_outlined,
                size: 36,
                color: Color(0xFFC5A059),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Your Basket is Empty',
              style: TextStyle(
                color: Color(0xFF2C2C2C),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Add premium gold bangles, chains, and classic rings to your basket. We will automatically calculate the best live price with zero hassle!',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFF707070),
                fontSize: 13,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 28),
            GestureDetector(
              onTap: () => widget.onTabChange(1), // Jump to Shop Tab
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
                  'BROWSE PRODUCTS',
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
}
