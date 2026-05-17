import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../providers/store_provider.dart';

class ProfileScreen extends StatefulWidget {
  final StoreProvider provider;

  const ProfileScreen({
    super.key,
    required this.provider,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with SingleTickerProviderStateMixin {
  late AnimationController _spinController;
  late Animation<double> _animation;
  
  final List<String> _prizes = ['₹100', '₹50', '₹500', 'Try Again', '₹1000', '₹250'];
  final List<double> _prizeValues = [100.0, 50.0, 500.0, 0.0, 1000.0, 250.0];

  int _selectedPrizeIndex = 2; // Default targeting index 2 (₹500) for a nice first win!
  bool _isSpinning = false;

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4), // 4 seconds of suspenseful spinning!
    );

    _animation = CurvedAnimation(
      parent: _spinController,
      curve: Curves.decelerate,
    );

    _spinController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _onSpinComplete();
      }
    });
  }

  @override
  void dispose() {
    _spinController.dispose();
    super.dispose();
  }

  void _startSpinning() {
    if (_isSpinning || widget.provider.hasSpunWheel) return;

    setState(() {
      _isSpinning = true;
      // Target a rewarding prize! Let's choose index 2 (₹500) or index 5 (₹250)
      _selectedPrizeIndex = math.Random().nextBool() ? 2 : 5;
    });

    // Calculate dynamic rotation angle: 6 full spins + offset for selected wedge
    final double wedgeAngle = (2 * math.pi) / _prizes.length;
    // Align index properly. We rotate counterclockwise, target marker is at the top (-pi/2)
    final double targetAngle = (2 * math.pi * 6) + (_prizes.length - _selectedPrizeIndex) * wedgeAngle - (math.pi / 2);

    _animation = Tween<double>(
      begin: 0,
      end: targetAngle,
    ).animate(CurvedAnimation(
      parent: _spinController,
      curve: Curves.decelerate,
    ));

    _spinController.reset();
    _spinController.forward();
  }

  void _onSpinComplete() {
    final double prizeValue = _prizeValues[_selectedPrizeIndex];
    final String prizeText = _prizes[_selectedPrizeIndex];

    setState(() {
      _isSpinning = false;
    });

    if (prizeValue > 0) {
      final String code = "LUCKY$prizeText";
      widget.provider.redeemSpinWheelPrize(prizeValue, code);

      // Celebrate with beautiful Dialog!
      _showCongratsDialog(prizeText, code);
    } else {
      widget.provider.setSpunWheel();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Better luck next time! You unlocked a special discount code anyway!'),
          backgroundColor: Colors.amber,
        ),
      );
    }
  }

  void _showCongratsDialog(String prize, String code) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Center(
            child: Text(
              '🎉 CONGRATULATIONS! 🎉',
              style: TextStyle(
                color: Color(0xFFC5A059),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              const Icon(Icons.stars_rounded, size: 64, color: Color(0xFFD4AF37)),
              const SizedBox(height: 16),
              Text(
                'You won $prize Referral Rewards Cash!',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF2C2C2C),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'This amount has been instantly added to your virtual wallet. You also unlocked an extra 5% shopping coupon code:',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF707070), fontSize: 12),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDFBF7),
                  border: Border.all(color: const Color(0xFFC5A059)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  code,
                  style: const TextStyle(
                    color: Color(0xFFC5A059),
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ],
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'CLAIM NOW',
                style: TextStyle(
                  color: Color(0xFFC5A059),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = widget.provider;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. User Header Block
          _buildProfileHeader(provider),

          // 2. Dynamic Virtual Wallet Card
          _buildWalletCard(provider),

          // 3. Referral Sharing Center
          _buildReferralSection(provider),

          // 4. Custom Painted Animated Spin Wheel Or Promotional Banner
          _buildSpinWheelSection(provider),

          const SizedBox(height: 36),
        ],
      ),
    );
  }

  // Profile Header block
  Widget _buildProfileHeader(StoreProvider provider) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0x33C5A059),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                'A', // Guest User Initial
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Welcome, Arham Guest',
                  style: TextStyle(
                    color: Color(0xFF2C2C2C),
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, color: Color(0xFFD4AF37), size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'Gold Elite Member • ${provider.successfulReferrals} Invites',
                      style: const TextStyle(
                        color: Color(0xFF707070),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Virtual Wallet Balance
  Widget _buildWalletCard(StoreProvider provider) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFF2C2C2C), Color(0xFF1E1E1E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'REFERRAL CASH WALLET',
                style: TextStyle(
                  color: Color(0xFFC5A059),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF444444),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.security, color: Color(0xFFC5A059), size: 10),
                    SizedBox(width: 4),
                    Text(
                      '100% SECURE',
                      style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '₹${provider.walletBalance.toStringAsFixed(0)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Earn ₹200 for every successfully referred friend who runs this app! Redeems automatically on checkout.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 11,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  // Referral Section
  Widget _buildReferralSection(StoreProvider provider) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x33C5A059)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Your Referral Code',
            style: TextStyle(
              color: Color(0xFF2C2C2C),
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9F6F0),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    provider.referralCode,
                    style: const TextStyle(
                      color: Color(0xFFC5A059),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: () {
                  provider.addReferralBonus();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Referral link copied! Simulated friend install: Added ₹200 virtual cash!'),
                      backgroundColor: Color(0xFFC5A059),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'SHARE',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Custom Painted Spin Wheel block
  Widget _buildSpinWheelSection(StoreProvider provider) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            '🎰 LUCKY SPIN WHEEL 🎰',
            style: TextStyle(
              color: Color(0xFFC5A059),
              fontSize: 14,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Spin once a day to win real wallet referral bonuses and shopping codes!',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFF707070),
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 24),

          if (provider.hasSpunWheel) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFDFBF7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x33C5A059)),
              ),
              child: const Column(
                children: [
                  Icon(Icons.check_circle_outline_rounded, color: Color(0xFFC5A059), size: 48),
                  SizedBox(height: 12),
                  Text(
                    'Spin Used Today!',
                    style: TextStyle(
                      color: Color(0xFF2C2C2C),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'You have already claimed your lucky referral bonus and extra 5% checkout coupon. Come back tomorrow for another spin!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF707070), fontSize: 11, height: 1.4),
                  ),
                ],
              ),
            ),
          ] else ...[
            // Spin Wheel Container with Painter
            Stack(
              alignment: Alignment.center,
              children: [
                // Animated Custom Painted Wheel
                AnimatedBuilder(
                  animation: _animation,
                  builder: (context, child) {
                    return Transform.rotate(
                      angle: _animation.value,
                      child: CustomPaint(
                        size: const Size(220, 220),
                        painter: WheelPainter(_prizes),
                      ),
                    );
                  },
                ),
                // Top Pin marker pointing to active prize
                Positioned(
                  top: 0,
                  child: Container(
                    width: 0,
                    height: 0,
                    decoration: const BoxDecoration(
                      border: Border(
                        left: BorderSide(color: Colors.transparent, width: 12),
                        right: BorderSide(color: Colors.transparent, width: 12),
                        bottom: BorderSide(color: Colors.redAccent, width: 24),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Spin Trigger Button
            GestureDetector(
              onTap: _startSpinning,
              child: Container(
                width: 160,
                height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _isSpinning 
                      ? [Colors.grey, Colors.grey] 
                      : [const Color(0xFFD4AF37), const Color(0xFFC5A059)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0x33C5A059),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    _isSpinning ? 'SPINNING...' : 'SPIN NOW',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// Custom Painter for the Spin Wheel Wedges (Premium Native)
class WheelPainter extends CustomPainter {
  final List<String> prizes;
  WheelPainter(this.prizes);

  @override
  void paint(Canvas canvas, Size size) {
    final double radius = size.width / 2;
    final Paint paint = Paint()..style = PaintingStyle.fill;
    final double angle = 2 * math.pi / prizes.length;

    // Palette of rich e-commerce gold and charcoal colors
    final List<Color> colors = [
      const Color(0xFFD4AF37), // Pure Gold
      const Color(0xFF2C2C2C), // Charcoal
      const Color(0xFFC5A059), // Light Gold
      const Color(0xFF1E1E1E), // Deep Charcoal
      const Color(0xFFE5C158), // Amber gold
      const Color(0xFF3E3E3E), // Cool grey
    ];

    for (int i = 0; i < prizes.length; i++) {
      paint.color = colors[i % colors.length];
      canvas.drawArc(
        Rect.fromLTWH(0, 0, size.width, size.height),
        i * angle,
        angle,
        true,
        paint,
      );

      // Draw prize text label
      final textPainter = TextPainter(
        text: TextSpan(
          text: prizes[i],
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();

      // Position text along the center angle of the wedge
      final double textAngle = i * angle + (angle / 2);
      final double x = radius + (radius * 0.6) * math.cos(textAngle);
      final double y = radius + (radius * 0.6) * math.sin(textAngle);

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(textAngle + math.pi / 2);
      textPainter.paint(canvas, Offset(-textPainter.width / 2, -textPainter.height / 2));
      canvas.restore();
    }

    // Outer circle border decoration
    final borderPaint = Paint()
      ..color = const Color(0xFFC5A059)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;
    canvas.drawCircle(Offset(radius, radius), radius, borderPaint);

    // Inner pin ring
    paint.color = const Color(0xFFD4AF37);
    canvas.drawCircle(Offset(radius, radius), 16, paint);
    paint.color = Colors.white;
    canvas.drawCircle(Offset(radius, radius), 6, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
