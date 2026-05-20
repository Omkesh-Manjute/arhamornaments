import 'package:flutter/material.dart';
import '../providers/store_provider.dart';
import '../widgets/arham_app_bar.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  final StoreProvider provider;

  const PrivacyPolicyScreen({
    super.key,
    required this.provider,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFAF6), // Standard clean background
      appBar: ArhamAppBar(
        provider: provider,
        showHamburger: false,
        onWishlistTap: null, // Disabled on this specific text page
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const ClampingScrollPhysics(),
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Page title
              const Center(
                child: Text(
                  'PRIVACY POLICY',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    color: Color(0xFF2C2C2C),
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2.0,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Container(
                  width: 60,
                  height: 2.5,
                  decoration: BoxDecoration(
                    color: const Color(0xFFC5A059),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Introduction
              _buildSectionTitle('1. INTRODUCTION'),
              _buildSectionBody(
                'Welcome to Arham Ornaments. We are committed to protecting your personal privacy and '
                'ensuring the security of your transactions and data. This Privacy Policy describes how we '
                'collect, use, disclose, and safeguard your information when you use our mobile application '
                'and online jewelry services.',
              ),

              _buildSectionTitle('2. INFORMATION WE COLLECT'),
              _buildSectionBody(
                'To deliver a premium jewelry shopping experience, we may collect information in several ways:\n\n'
                '• Account Information: Your name, email address, telephone number, and physical shipping address '
                'which you submit when registering or completing purchases.\n'
                '• Transaction History: Detailed purchase history, order values, and gold/silver customization options.\n'
                '• Virtual Wallet & Promotions: Earnings, wheel spins, and lucky coupon balances tracked '
                'securely in your encrypted profile state.\n'
                '• Technical Data: Device specifications, IP address, notifications token, and local store '
                'persistence data.',
              ),

              _buildSectionTitle('3. HOW WE USE YOUR INFORMATION'),
              _buildSectionBody(
                'We process your information in accordance with luxury retail standards and security practices:\n\n'
                '• To securely fulfill orders, verify shipments, and manage standard delivery coordinates.\n'
                '• To accurately calculate live gold rates, billing margins, and virtual wallet promotions.\n'
                '• To push instantaneous notifications regarding newly launched collection events, order updates, '
                'and exclusive lucky wheel rewards.\n'
                '• To prevent malicious actions, transaction fraud, and ensure extreme account integrity.',
              ),

              _buildSectionTitle('4. SECURE TRANSACTION POLICY'),
              _buildSectionBody(
                'Security is our primary commitment. We employ advanced administrative, physical, '
                'and digital security controls. All payments are encrypted through industry-standard secure socket layers. '
                'We never store full credit/debit card numbers or personal net-banking security credentials on our local servers. '
                'Your referral codes and wallet transactions are processed via cloud-synced firestore endpoints, assuring absolute safety.',
              ),

              _buildSectionTitle('5. SHARING OF INFORMATION'),
              _buildSectionBody(
                'Arham Ornaments does not trade, rent, or sell your private personal credentials to any '
                'third-party organizations. We only share information with trusted courier partners solely '
                'to facilitate shipping and secure dispatching of high-value jewelry parcels to your doorstep.',
              ),

              _buildSectionTitle('6. YOUR RIGHTS & CHOICES'),
              _buildSectionBody(
                'You maintain complete sovereignty over your details:\n\n'
                '• Access & Update: You can update your profile name, shipping address, or phone number directly '
                'through the Profile Screen.\n'
                '• Notifications: You can enable or disable push notifications at the device level anytime.\n'
                '• Account Removal: You may request database account deletion by contacting our Direct Sales Support '
                'helpline directly.',
              ),

              _buildSectionTitle('7. AMENDMENTS & CONTACT'),
              _buildSectionBody(
                'We may update this policy periodically to reflect operational, legal, or security adjustments. '
                'If you have any questions regarding our safety protocols or data management, please '
                'navigate to the Contact Us screen or call our support lines immediately.',
              ),

              const SizedBox(height: 48),

              // Footer branding
              const Center(
                child: Text(
                  'ARHAM ORNAMENTS • TRUST & LUXURY',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    color: Color(0xFFC5A059),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 24.0, bottom: 8.0),
      child: Text(
        title,
        style: const TextStyle(
          fontFamily: 'Outfit',
          color: Color(0xFF2C2C2C),
          fontSize: 14,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
        ),
      ),
    );
  }

  // Section body text builder
  Widget _buildSectionBody(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontFamily: 'Outfit',
        color: Color(0xFF707070),
        fontSize: 13,
        height: 1.6,
        fontWeight: FontWeight.w400,
      ),
    );
  }
}
