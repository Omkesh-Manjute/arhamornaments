import 'dart:math';
import 'package:flutter/material.dart';
import '../providers/store_provider.dart';

class LuckyWheelDialog extends StatefulWidget {
  final StoreProvider provider;

  const LuckyWheelDialog({super.key, required this.provider});

  static void show(BuildContext context, StoreProvider provider) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => LuckyWheelDialog(provider: provider),
    );
  }

  @override
  State<LuckyWheelDialog> createState() => _LuckyWheelDialogState();
}

class _LuckyWheelDialogState extends State<LuckyWheelDialog> with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;
  late Animation<double> _rotationAnimation;

  final List<Map<String, dynamic>> _prizes = [
    {'label': '₹50 Cash', 'value': 50.0, 'color': const Color(0xFF1E3A8A)}, // Deep Royal Blue
    {'label': '₹100 Cash', 'value': 100.0, 'color': const Color(0xFFC5A059)}, // Gold
    {'label': '₹200 Gold', 'value': 200.0, 'color': const Color(0xFF111827)}, // Rich Dark
    {'label': '₹500 MEGA', 'value': 500.0, 'color': const Color(0xFFD97706)}, // Golden Orange
    {'label': 'Try Again', 'value': 0.0, 'color': const Color(0xFFEF4444)}, // Red
    {'label': '₹150 Gift', 'value': 150.0, 'color': const Color(0xFF1E3A8A)}, // Deep Royal Blue
    {'label': '₹250 Arham', 'value': 250.0, 'color': const Color(0xFFC5A059)}, // Gold
    {'label': '₹300 Promo', 'value': 300.0, 'color': const Color(0xFF111827)}, // Rich Dark
  ];

  bool _isSpinning = false;
  int _selectedIndex = 0;
  bool _showCongratulations = false;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );

    _rotationAnimation = CurvedAnimation(
      parent: _rotationController,
      curve: Curves.easeOutCubic,
    );
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  void _spinWheel() {
    if (_isSpinning) return;

    if (widget.provider.hasSpunWheel) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('You have already used your spin for today! Refer friends to earn more!'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() {
      _isSpinning = true;
      _showCongratulations = false;
    });

    // Pick a winning index (favoring gold voucher or nice cash prizes to make it rewarding!)
    final random = Random();
    // 80% chance to win ₹200 or ₹250 or ₹500, 20% to win ₹100 or ₹150. Always a win!
    final List<int> rewardingIndices = [0, 1, 2, 3, 5, 6, 7];
    _selectedIndex = rewardingIndices[random.nextInt(rewardingIndices.length)];

    // Calculate rotation angle
    // Each segment is 360 / 8 = 45 degrees (pi / 4 radians)
    // We want the wheel to spin at least 5 full rotations, and land on the selected index.
    // The pointer is at the top (angle = -pi / 2).
    // The index 0 is between angle 0 and 45 degrees, etc.
    // To land index 'i' at the top pointer:
    // Target angle = (5 * 2 * pi) + (2 * pi - (i * 2 * pi / 8)) - (pi / 8);
    final double segmentAngle = 2 * pi / 8;
    final double targetRotation = (8 * 2 * pi) + (2 * pi - (_selectedIndex * segmentAngle)) - (pi / 8);

    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: targetRotation,
    ).animate(CurvedAnimation(
      parent: _rotationController,
      curve: Curves.easeOutQuart,
    ));

    _rotationController.reset();
    _rotationController.forward().then((_) {
      final prize = _prizes[_selectedIndex];
      widget.provider.redeemSpinWheelPrize(prize['value'], 'LUCKYSPIN${prize['value'].toInt()}');
      
      setState(() {
        _isSpinning = false;
        _showCongratulations = true;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool alreadySpun = widget.provider.hasSpunWheel && !_showCongratulations;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.white,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 32),
                  const Text(
                    'LUCKY WHEEL',
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: Color(0xFF111827),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Color(0xFF707070)),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const Divider(color: Color(0x1AC5A059), height: 16),

              if (_showCongratulations) ...[
                // Congratulations view
                const SizedBox(height: 16),
                const Icon(Icons.stars_rounded, color: Color(0xFFC5A059), size: 80),
                const SizedBox(height: 16),
                const Text(
                  'CONGRATULATIONS!',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFC5A059),
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'You won ${_prizes[_selectedIndex]['label']}!',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFDFBF7),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0x3AC5A059)),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'Added directly to your Virtual Wallet',
                        style: TextStyle(fontSize: 12, color: Color(0xFF707070)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${_prizes[_selectedIndex]['value'].toInt()}',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFC5A059),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC5A059),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('AWESOME, THANKS!', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ] else if (alreadySpun) ...[
                // Already Spun view
                const SizedBox(height: 24),
                const Icon(Icons.lock_clock_rounded, color: Color(0xFFC5A059), size: 70),
                const SizedBox(height: 16),
                const Text(
                  'SPIN LOCKED',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'You have already spun the wheel today. Invite friends to register and earn active spins instantly!',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: Color(0xFF707070), height: 1.4),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'CODE: ${widget.provider.referralCode}',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2C2C2C), fontSize: 13),
                      ),
                      TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Referral code copied to clipboard!')),
                          );
                        },
                        child: const Text('COPY', style: TextStyle(color: Color(0xFFC5A059), fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2C2C2C),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('CLOSE'),
                ),
              ] else ...[
                // Main spinning wheel view
                const SizedBox(height: 12),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Pointer at the top
                    Container(
                      height: 270,
                      width: 270,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Color(0x1F000000), blurRadius: 16, spreadRadius: 2),
                        ],
                      ),
                      child: AnimatedBuilder(
                        animation: _rotationAnimation,
                        builder: (context, child) {
                          return Transform.rotate(
                            angle: _rotationAnimation.value,
                            child: CustomPaint(
                              painter: _WheelPainter(prizes: _prizes),
                            ),
                          );
                        },
                      ),
                    ),
                    // Pointer needle at top center pointing down
                    Positioned(
                      top: 0,
                      child: CustomPaint(
                        size: const Size(24, 24),
                        painter: _PointerPainter(),
                      ),
                    ),
                    // Elegant center core button
                    GestureDetector(
                      onTap: _spinWheel,
                      child: Container(
                        height: 54,
                        width: 54,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFC5A059), width: 3),
                          boxShadow: const [
                            BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 2)),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            _isSpinning ? 'SPIN' : 'SPIN',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFFC5A059),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Tap SPIN to try your luck and win instant credits!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF707070),
                    fontStyle: FontStyle.italic,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _isSpinning ? null : _spinWheel,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC5A059),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 3,
                  ),
                  child: Text(
                    _isSpinning ? 'SPINNING...' : 'SPIN NOW!',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}

class _WheelPainter extends CustomPainter {
  final List<Map<String, dynamic>> prizes;

  _WheelPainter({required this.prizes});

  @override
  void paint(Canvas canvas, Size size) {
    final double radius = size.width / 2;
    final Offset center = Offset(radius, radius);
    final double segmentAngle = 2 * pi / prizes.length;

    final Paint paint = Paint()..style = PaintingStyle.fill;
    final Paint borderPaint = Paint()
      ..color = const Color(0xFFFDFBF7)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final Paint goldRingPaint = Paint()
      ..color = const Color(0xFFC5A059)
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke;

    // Draw Slices
    for (int i = 0; i < prizes.length; i++) {
      paint.color = prizes[i]['color'];
      
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        i * segmentAngle - pi / 8 - segmentAngle / 2,
        segmentAngle,
        true,
        paint,
      );

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        i * segmentAngle - pi / 8 - segmentAngle / 2,
        segmentAngle,
        true,
        borderPaint,
      );
    }

    // Draw Gold Outer Ring
    canvas.drawCircle(center, radius, goldRingPaint);

    // Draw Text on segments
    for (int i = 0; i < prizes.length; i++) {
      final double textAngle = i * segmentAngle - pi / 8;
      canvas.save();
      
      // Translate to center, rotate, then translate out
      canvas.translate(center.dx, center.dy);
      canvas.rotate(textAngle);
      
      final textSpan = TextSpan(
        text: prizes[i]['label'],
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          fontFamily: 'Outfit',
        ),
      );

      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
        textAlign: TextAlign.center,
      );

      textPainter.layout();
      // Draw text horizontally relative to rotated canvas
      textPainter.paint(
        canvas,
        Offset(radius * 0.45, -textPainter.height / 2),
      );

      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PointerPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path()
      ..moveTo(size.width / 2, size.height)
      ..lineTo(0, 0)
      ..lineTo(size.width, 0)
      ..close();

    final Paint paint = Paint()
      ..color = const Color(0xFFD97706) // Intense gold/orange needle
      ..style = PaintingStyle.fill;

    final Paint borderPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    canvas.drawPath(path, paint);
    canvas.drawPath(path, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
