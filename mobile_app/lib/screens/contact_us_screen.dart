import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ContactUsScreen extends StatelessWidget {
  const ContactUsScreen({super.key});

  // Helper method to trigger the phone dialer
  Future<void> _callNumber(BuildContext context, String phoneNumber) async {
    final Uri tel = Uri.parse('tel:$phoneNumber');
    try {
      if (await canLaunchUrl(tel)) {
        await launchUrl(tel);
      } else {
        throw 'Could not launch dialer';
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Contact Number: $phoneNumber'),
            backgroundColor: const Color(0xFFC5A059),
          ),
        );
      }
    }
  }

  // Helper method to open URLs
  Future<void> _openUrl(BuildContext context, String urlString) async {
    final Uri url = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        throw 'Could not launch URL';
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not open the link. Please try again later.'),
            backgroundColor: Color(0xFFC5A059),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Custom Back Navigation Button (Reference top-left <-)
            Padding(
              padding: const EdgeInsets.only(left: 12.0, top: 12.0),
              child: IconButton(
                icon: const Icon(
                  Icons.arrow_back_rounded,
                  color: Colors.black87,
                  size: 28,
                ),
                tooltip: 'Back',
                onPressed: () => Navigator.maybePop(context),
              ),
            ),

            // Main Scrollable Content Layout
            Expanded(
              child: SingleChildScrollView(
                physics: const ClampingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 12),
                    
                    // Centered Large Arham Ornaments logo
                    Center(
                      child: Image.asset(
                        'assets/icon.png', // The stylized A wing logo
                        height: 220,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 220,
                          width: 220,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFFCFAF6),
                            border: Border.all(color: const Color(0xFFC5A059), width: 2),
                          ),
                          child: const Icon(
                            Icons.filter_vintage_rounded,
                            color: Color(0xFFC5A059),
                            size: 80,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Heading: ADDRESS DETAILS (with diamond symbols ❖)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.widgets_rounded, color: Color(0xFF8D6E63), size: 16),
                        SizedBox(width: 10),
                        Text(
                          'ADDRESS DETAILS',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            color: Color(0xFF8D6E63),
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2.0,
                          ),
                        ),
                        SizedBox(width: 10),
                        Icon(Icons.widgets_rounded, color: Color(0xFF8D6E63), size: 16),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Store Name
                    const Text(
                      'ARHAM ORNAMENTS',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        color: Color(0xFF4E342E), // Rich warm dark brown
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.0,
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Store Address
                    const Text(
                      'Near Sandeep Travels, Prabhat Talkies road\nGondia 441601, Maharashtra',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        color: Color(0xFF5D4037),
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        height: 1.5,
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Contacts List with tap-to-call action buttons
                    _buildContactRow(context, 'Contact 1:', '+91 9371504182', '+919371504182'),
                    const SizedBox(height: 14),
                    _buildContactRow(context, 'Contact 2:', '+91 9356844481', '+919356844481'),

                    const SizedBox(height: 48),

                    // Social Media Buttons Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildSocialButton(
                          context,
                          child: const Text(
                            'f',
                            style: TextStyle(
                              fontFamily: 'serif',
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF5D4037),
                            ),
                          ),
                          url: 'https://www.facebook.com/arhamornaments',
                        ),
                        const SizedBox(width: 16),
                        _buildSocialButton(
                          context,
                          child: _buildInstagramGlyph(),
                          url: 'https://www.instagram.com/arham.ornaments?igsh=MTRvaTc2OWgxM2JtYg==',
                        ),
                        const SizedBox(width: 16),
                        _buildSocialButton(
                          context,
                          child: const Icon(
                            Icons.chat_bubble_rounded,
                            color: Color(0xFF5D4037),
                            size: 24,
                          ),
                          url: 'https://wa.me/919371504182?text=Hello%2C%20I%20am%20interested%20in%20your%20jewellery%20collection.',
                        ),
                        const SizedBox(width: 16),
                        _buildSocialButton(
                          context,
                          child: _buildYouTubeGlyph(),
                          url: 'https://www.youtube.com/@arhamornaments',
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // High fidelity Contact Row builder
  Widget _buildContactRow(BuildContext context, String label, String displayNum, String rawNum) {
    return GestureDetector(
      onTap: () => _callNumber(context, rawNum),
      behavior: HitTestBehavior.opaque,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '$label $displayNum',
            style: const TextStyle(
              fontFamily: 'Outfit',
              color: Color(0xFF5D4037),
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: Color(0xFFEFEBE9), // Light warm grey matching reference
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.phone_rounded,
              color: Color(0xFF5D4037),
              size: 16,
            ),
          ),
        ],
      ),
    );
  }

  // Premium Social media block button wrapper
  Widget _buildSocialButton(BuildContext context, {required Widget child, required String url}) {
    return Material(
      color: const Color(0xFFF5EBE1), // High fidelity light beige background
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => _openUrl(context, url),
        child: Container(
          width: 54,
          height: 54,
          alignment: Alignment.center,
          child: child,
        ),
      ),
    );
  }

  // High fidelity Instagram Camera Glyph using pure Containers
  Widget _buildInstagramGlyph() {
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFF5D4037), width: 2.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF5D4037), width: 1.8),
              shape: BoxShape.circle,
            ),
          ),
          Positioned(
            top: 1.5,
            right: 1.5,
            child: Container(
              width: 2.2,
              height: 2.2,
              decoration: const BoxDecoration(
                color: Color(0xFF5D4037),
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // High fidelity YouTube Play Glyph using standard CustomPainter or Container Stack
  Widget _buildYouTubeGlyph() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 24,
          height: 17,
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFF5D4037), width: 2.2),
            borderRadius: BorderRadius.circular(4.5),
          ),
        ),
        Positioned(
          left: 9.5,
          child: CustomPaint(
            size: const Size(6, 7),
            painter: _TrianglePainter(color: const Color(0xFF5D4037)),
          ),
        ),
      ],
    );
  }
}

// Simple triangle painter for the YouTube play button inside the custom glyph
class _TrianglePainter extends CustomPainter {
  final Color color;
  _TrianglePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, size.height / 2)
      ..lineTo(0, size.height)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
