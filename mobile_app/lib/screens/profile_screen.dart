import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/store_provider.dart';

class ProfileScreen extends StatefulWidget {
  final StoreProvider provider;

  const ProfileScreen({super.key, required this.provider});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  // Navigation Tabs state
  String _activeTab =
      'dashboard'; // 'dashboard', 'profile', 'notifications', 'wallet'

  // Join & Win Form controllers
  final _signupNameController = TextEditingController();
  final _signupEmailController = TextEditingController();
  final _signupPhoneController = TextEditingController();
  final _signupReferralController = TextEditingController();
  bool _agreeToTerms = false;
  final _signupFormKey = GlobalKey<FormState>();

  // OTP challenge state
  bool _isVerifyingOTP = false;
  final _otpController = TextEditingController();

  // Profile Form controllers
  final _profileNameController = TextEditingController();
  final _profileEmailController = TextEditingController();
  final _profilePhoneController = TextEditingController();
  final _profileAddressController = TextEditingController();
  final _profileCityController = TextEditingController();
  final _profileZipController = TextEditingController();
  bool _isEditingProfile = false;
  final _profileFormKey = GlobalKey<FormState>();

  // Invite Simulation controller

  // Spin Wheel controller
  late AnimationController _spinController;
  late Animation<double> _animation;

  final List<String> _prizes = [
    '₹100',
    '₹250',
    '₹500',
    'Try Again',
    '₹1000',
    '₹150',
  ];
  final List<double> _prizeValues = [100.0, 250.0, 500.0, 0.0, 1000.0, 150.0];
  final List<Color> _prizeColors = [
    const Color(0xFFC5A059), // Gold
    const Color(0xFF2C2C2C), // Charcoal
    const Color(0xFFD4AF37), // Intense Gold
    const Color(0xFF1E1E1E), // Dark Charcoal
    const Color(0xFFE5C158), // Amber
    const Color(0xFF3E3E3E), // Cool grey
  ];

  int _selectedPrizeIndex = 2; // Default targeting index 2 (₹500)
  bool _isSpinning = false;

  @override
  void initState() {
    super.initState();
    widget.provider.addListener(_onProviderUpdate);

    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(
        seconds: 4,
      ), // 4 seconds of suspenseful spinning!
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

    _initProfileControllers();
    if (widget.provider.isLoggedIn && widget.provider.userPhone.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          widget.provider.fetchLiveUserData(widget.provider.userPhone);
        }
      });
    }
  }

  void _onProviderUpdate() {
    if (mounted) {
      setState(() {
        if (!_isEditingProfile) {
          _initProfileControllers();
        }
      });
    }
  }

  void _initProfileControllers() {
    _profileNameController.text = widget.provider.userName;
    _profileEmailController.text = widget.provider.userEmail;
    _profilePhoneController.text = widget.provider.userPhone;
    _profileAddressController.text = widget.provider.streetAddress;
    _profileCityController.text = widget.provider.city;
    _profileZipController.text = widget.provider.pinCode;
  }

  @override
  void dispose() {
    widget.provider.removeListener(_onProviderUpdate);
    _spinController.dispose();
    _signupNameController.dispose();
    _signupEmailController.dispose();
    _signupPhoneController.dispose();
    _signupReferralController.dispose();
    _otpController.dispose();
    _profileNameController.dispose();
    _profileEmailController.dispose();
    _profilePhoneController.dispose();
    _profileAddressController.dispose();
    _profileCityController.dispose();
    _profileZipController.dispose();

    super.dispose();
  }

  void _startSpinning() {
    if (_isSpinning || widget.provider.hasSpunWheel) return;

    setState(() {
      _isSpinning = true;
      // Target a rewarding prize! Let's choose index 2 (₹500) or index 1 (₹250) or index 0 (₹100)
      final rewardingIndices = [0, 1, 2, 5];
      _selectedPrizeIndex =
          rewardingIndices[math.Random().nextInt(rewardingIndices.length)];
    });

    final double wedgeAngle = (2 * math.pi) / _prizes.length;
    // Mathematically perfect clockwise rotation to align the exact visual center of the selected wedge with the top 12 o'clock pointer
    final double targetAngle =
        (2 * math.pi * 6) +
        (1.5 * math.pi) -
        ((_selectedPrizeIndex + 0.5) * wedgeAngle);

    _animation = Tween<double>(begin: 0, end: targetAngle).animate(
      CurvedAnimation(parent: _spinController, curve: Curves.decelerate),
    );

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
      widget.provider.redeemSpinWheelPrize(prizeValue, "");
      _showCongratsDialog(prizeText);
    } else {
      widget.provider.setSpunWheel();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Better luck next time! Thanks for spinning!'),
          backgroundColor: Colors.amber,
        ),
      );
    }
  }

  void _showCongratsDialog(String prize) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
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
              const Icon(
                Icons.stars_rounded,
                size: 64,
                color: Color(0xFFD4AF37),
              ),
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
                'This amount has been instantly added to your virtual wallet. Use it to discount your next order!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF707070), fontSize: 12),
              ),
              const SizedBox(height: 12),
            ],
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC5A059),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'GREAT, THANK YOU!',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );
  }

  // Handle click on notification links
  void _handleNotificationLink(String link) async {
    if (link.startsWith('tel:')) {
      final Uri telUri = Uri.parse(link);
      try {
        if (await canLaunchUrl(telUri)) {
          await launchUrl(telUri);
        } else {
          throw 'Could not launch support line';
        }
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Support line: ${link.replaceAll('tel:', '')}'),
          ),
        );
      }
    } else if (link.startsWith('/products')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Redirecting you to the Jewellery Catalog Store! Check the Shop tab below.',
          ),
          backgroundColor: Color(0xFFC5A059),
        ),
      );
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Opening: $link')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = widget.provider;

    // Check if user is logged in
    if (!provider.isLoggedIn) {
      return _buildLoginSignUpView(provider);
    }

    return _buildUserDashboardView(provider);
  }

  // ==========================================
  // SCREEN 1: LOGIN / SIGN UP GATE (TWO-PANE)
  // ==========================================
  Widget _buildLoginSignUpView(StoreProvider provider) {
    return SingleChildScrollView(
      physics: const ClampingScrollPhysics(),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isWideScreen = constraints.maxWidth > 650;

          final wheelWidget = Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E1E1E), Color(0xFF111827)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFC5A059), width: 1.5),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFC5A059).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFC5A059),
                      width: 0.8,
                    ),
                  ),
                  child: const Text(
                    'EXCLUSIVE REWARDS',
                    style: TextStyle(
                      color: Color(0xFFC5A059),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'ARHAM LUCKY WHEEL',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Register today & claim your free initial spin! Win credits up to ₹1,000 instantly.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70, fontSize: 11),
                ),
                const SizedBox(height: 24),
                // Custom painted spin wheel preview
                Stack(
                  alignment: Alignment.center,
                  children: [
                    CustomPaint(
                      size: const Size(200, 200),
                      painter: WheelPainter(_prizes, _prizeColors),
                    ),
                    Positioned(
                      top: 0,
                      child: Container(
                        width: 0,
                        height: 0,
                        decoration: const BoxDecoration(
                          border: Border(
                            left: BorderSide(
                              color: Colors.transparent,
                              width: 8,
                            ),
                            right: BorderSide(
                              color: Colors.transparent,
                              width: 8,
                            ),
                            bottom: BorderSide(
                              color: Colors.redAccent,
                              width: 18,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Container(
                      height: 40,
                      width: 40,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Colors.black38, blurRadius: 4),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.stars_rounded,
                          color: Color(0xFFC5A059),
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );

          final formWidget = Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Form(
              key: _signupFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _isVerifyingOTP ? 'Verify Phone OTP' : 'Join & Win',
                    style: const TextStyle(
                      fontFamily: 'Outfit',
                      color: Color(0xFF2C2C2C),
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _isVerifyingOTP
                        ? 'We sent a 6-digit verification code to +91 ${_signupPhoneController.text.trim()}'
                        : 'Get ₹100 instantly by registering with a referral code!',
                    style: const TextStyle(
                      color: Color(0xFF707070),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 20),

                  if (!_isVerifyingOTP) ...[
                    // Full Name
                    TextFormField(
                      controller: _signupNameController,
                      decoration: InputDecoration(
                        labelText: 'Full Name',
                        prefixIcon: const Icon(
                          Icons.person_outline_rounded,
                          color: Color(0xFFC5A059),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFC5A059),
                            width: 1.5,
                          ),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Please enter your name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Email
                    TextFormField(
                      controller: _signupEmailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                        labelText: 'Email Address',
                        prefixIcon: const Icon(
                          Icons.email_outlined,
                          color: Color(0xFFC5A059),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFC5A059),
                            width: 1.5,
                          ),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || !val.contains('@')) {
                          return 'Enter a valid email address';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Phone Number +91 Flag Selector
                    TextFormField(
                      controller: _signupPhoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: 'Phone Number',
                        prefixIcon: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const SizedBox(width: 12),
                            const Text(
                              "🇮🇳 +91",
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF2C2C2C),
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              height: 20,
                              width: 1,
                              color: Colors.black26,
                            ),
                            const SizedBox(width: 8),
                          ],
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFC5A059),
                            width: 1.5,
                          ),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().length < 10) {
                          return 'Enter a valid 10-digit number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Referral Code (Optional - get ₹100 bonus)
                    TextFormField(
                      controller: _signupReferralController,
                      textCapitalization: TextCapitalization.characters,
                      decoration: InputDecoration(
                        labelText: 'Referral Code (Optional — get ₹100 bonus)',
                        prefixIcon: const Icon(
                          Icons.stars_rounded,
                          color: Color(0xFFC5A059),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFC5A059),
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Checkbox Terms
                    Row(
                      children: [
                        Checkbox(
                          value: _agreeToTerms,
                          activeColor: const Color(0xFFC5A059),
                          onChanged: (val) {
                            setState(() {
                              _agreeToTerms = val ?? false;
                            });
                          },
                        ),
                        const Expanded(
                          child: Text(
                            'I agree to the Terms & Conditions and Privacy Policy.',
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF707070),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ] else ...[
                    // OTP Verification input box
                    const Text(
                      'Enter 6-Digit OTP:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2C2C2C),
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Stack(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(6, (index) {
                            String char = "";
                            if (_otpController.text.length > index) {
                              char = _otpController.text[index];
                            }
                            final bool isFocused =
                                _otpController.text.length == index;
                            return Container(
                              width: 36,
                              height: 48,
                              decoration: BoxDecoration(
                                color: const Color(0xFFFDFBF7),
                                border: Border.all(
                                  color: isFocused
                                      ? const Color(0xFFD4AF37)
                                      : const Color(
                                          0xFFC5A059,
                                        ).withValues(alpha: 0.3),
                                  width: isFocused ? 2.0 : 1.0,
                                ),
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: isFocused
                                    ? [
                                        const BoxShadow(
                                          color: Color(0x22D4AF37),
                                          blurRadius: 6,
                                          spreadRadius: 1,
                                        ),
                                      ]
                                    : [],
                              ),
                              child: Center(
                                child: Text(
                                  char,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF2C2C2C),
                                  ),
                                ),
                              ),
                            );
                          }),
                        ),
                        Positioned.fill(
                          child: Opacity(
                            opacity: 0.01,
                            child: TextField(
                              controller: _otpController,
                              keyboardType: TextInputType.number,
                              maxLength: 6,
                              onChanged: (val) {
                                setState(() {});
                              },
                              decoration: const InputDecoration(
                                counterText: "",
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Resend and Back controls
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'New test OTP code sent! Use 123456.',
                                ),
                                backgroundColor: Color(0xFFC5A059),
                              ),
                            );
                          },
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                          ),
                          child: const Text(
                            'Resend Code',
                            style: TextStyle(
                              color: Color(0xFF707070),
                              fontSize: 11,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _isVerifyingOTP = false;
                              _otpController.clear();
                            });
                          },
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                          ),
                          child: const Text(
                            'Change Details',
                            style: TextStyle(
                              color: Color(0xFFC5A059),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Submit Button
                  GestureDetector(
                    onTap: () {
                      if (!_isVerifyingOTP) {
                        if (!_signupFormKey.currentState!.validate()) return;
                        if (!_agreeToTerms) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Please accept the terms and conditions',
                              ),
                            ),
                          );
                          return;
                        }
                        setState(() {
                          _isVerifyingOTP = true;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'OTP sent to +91! Use testing code: 123456',
                            ),
                            backgroundColor: Color(0xFFC5A059),
                          ),
                        );
                      } else {
                        if (_otpController.text.length < 6) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Please enter the 6-digit OTP code',
                              ),
                            ),
                          );
                          return;
                        }
                        if (_otpController.text != '123456') {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Invalid verification code! Try code: 123456 for testing.',
                              ),
                              backgroundColor: Colors.redAccent,
                            ),
                          );
                          return;
                        }

                        // Complete registration
                        provider.registerUser(
                          _signupNameController.text.trim(),
                          _signupEmailController.text.trim(),
                          _signupPhoneController.text.trim(),
                          _signupReferralController.text.trim().toUpperCase(),
                        );

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              _signupReferralController.text.isNotEmpty
                                  ? 'Welcome! Referral applied, ₹100 welcome bonus added to your Wallet!'
                                  : 'Welcome registered successfully!',
                            ),
                            backgroundColor: const Color(0xFFC5A059),
                          ),
                        );
                      }
                    },
                    child: Container(
                      height: 52,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(14),
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
                          _isVerifyingOTP
                              ? 'VERIFY & REGISTER'
                              : 'SEND OTP & CONTINUE',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );

          if (isWideScreen) {
            return Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 4, child: wheelWidget),
                  const SizedBox(width: 24),
                  Expanded(flex: 5, child: formWidget),
                ],
              ),
            );
          } else {
            return Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [wheelWidget, const SizedBox(height: 16), formWidget],
              ),
            );
          }
        },
      ),
    );
  }

  // ==========================================
  // MAIN MULTI-TAB USER DASHBOARD SCREEN
  // ==========================================
  Widget _buildUserDashboardView(StoreProvider provider) {
    return Column(
      children: [
        // Horizontal premium scrollable selector tab bar
        Container(
          height: 60,
          color: Colors.white,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const ClampingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            children: [
              _buildTabButton(
                'dashboard',
                Icons.dashboard_rounded,
                'Dashboard',
              ),
              _buildTabButton('profile', Icons.person_rounded, 'My Profile'),
              _buildTabButton(
                'notifications',
                Icons.notifications_rounded,
                'Notifications',
                badgeCount: provider.notificationsList.length,
              ),
              _buildTabButton(
                'wallet',
                Icons.account_balance_wallet_rounded,
                'Wallet & Rewards',
              ),
              _buildTabButton('signout', Icons.logout_rounded, 'Sign Out'),
            ],
          ),
        ),
        Container(height: 1, color: const Color(0x1AC5A059)),
        if (provider.isSyncingUser)
          const LinearProgressIndicator(
            backgroundColor: Colors.transparent,
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFC5A059)),
            minHeight: 2,
          ),

        // Body area representing active page tab
        Expanded(
          child: SingleChildScrollView(
            physics: const ClampingScrollPhysics(),
            child: _buildActiveTabContent(provider),
          ),
        ),
      ],
    );
  }

  Widget _buildTabButton(
    String id,
    IconData icon,
    String title, {
    int badgeCount = 0,
  }) {
    final isActive = _activeTab == id;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: ChoiceChip(
        label: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: isActive ? Colors.white : const Color(0xFF707070),
            ),
            const SizedBox(width: 6),
            Text(title),
            if (badgeCount > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 5,
                  vertical: 1.5,
                ),
                decoration: const BoxDecoration(
                  color: Colors.redAccent,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '$badgeCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        selected: isActive,
        selectedColor: const Color(0xFFC5A059),
        backgroundColor: const Color(0xFFFCFAF6),
        labelStyle: TextStyle(
          color: isActive ? Colors.white : const Color(0xFF2C2C2C),
          fontWeight: FontWeight.bold,
          fontSize: 11.5,
        ),
        side: BorderSide(
          color: isActive ? const Color(0xFFC5A059) : const Color(0x1AC5A059),
        ),
        onSelected: (selected) {
          if (selected) {
            if (id == 'signout') {
              _showSignOutConfirmation();
            } else {
              setState(() {
                _activeTab = id;
              });
            }
          }
        },
      ),
    );
  }

  void _showSignOutConfirmation() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text(
            'Sign Out',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          content: const Text(
            'Are you sure you want to sign out of your premium Arham dashboard?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                widget.provider.signOut();
                setState(() {
                  _activeTab = 'dashboard';
                });
              },
              child: const Text(
                'Sign Out',
                style: TextStyle(
                  color: Colors.redAccent,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildActiveTabContent(StoreProvider provider) {
    switch (_activeTab) {
      case 'dashboard':
        return _buildDashboardTab(provider);
      case 'profile':
        return _buildProfileTab(provider);
      case 'notifications':
        return _buildNotificationsTab(provider);
      case 'wallet':
        return _buildWalletTab(provider);
      default:
        return _buildDashboardTab(provider);
    }
  }

  // ==========================================
  // DASHBOARD SUB-VIEW (SCREEN 2 & SPIN WHEEL)
  // ==========================================
  Widget _buildDashboardTab(StoreProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Elegant Header card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF111827), Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFC5A059), width: 1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ARHAM ELITE REFERRALS',
                  style: TextStyle(
                    color: Color(0xFFC5A059),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Share the Radiance, Earn Together',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Invite your friends to experience Arham Ornaments. They get ₹100 welcome bonus and a free spin, and you earn ₹100 instantly!',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),

                // Referral Code Block
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0x6BC5A059)),
                        ),
                        child: Text(
                          provider.userReferralCode,
                          style: const TextStyle(
                            color: Color(0xFFC5A059),
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(
                        Icons.copy_rounded,
                        color: Color(0xFFC5A059),
                      ),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.all(12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Clipboard.setData(
                          ClipboardData(text: provider.userReferralCode),
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Referral code copied to clipboard!'),
                          ),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Invite Friends trigger
                ElevatedButton.icon(
                  onPressed: () {
                    Share.share(
                      "Join Arham Ornaments today and get ₹100 instant credits! ✨\n\nUse my referral code: ${provider.userReferralCode}\n\nSign up here: https://www.arhamornaments.com/?ref=${provider.userReferralCode}",
                      subject: "Arham Ornaments Invitation",
                    );
                  },
                  icon: const Icon(Icons.share_rounded, size: 14),
                  label: const Text(
                    'INVITE FRIENDS',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC5A059),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 44),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2x2 Stats Cards Grid
          const Text(
            'Program Accomplishments',
            style: TextStyle(
              color: Color(0xFF2C2C2C),
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
            children: [
              _buildStatsCard(
                'Total Invites',
                '${provider.successfulReferrals} friends',
                Icons.people_alt_rounded,
                const Color(0x1F2563EB),
              ),
              _buildStatsCard(
                'Total Winnings',
                '₹${provider.referralEarnings.toStringAsFixed(0)}',
                Icons.stars_rounded,
                const Color(0x1F10B981),
              ),
              _buildStatsCard(
                'Program Tier',
                provider.programTier,
                Icons.workspace_premium_rounded,
                const Color(0x1FC5A059),
              ),
              _buildStatsCard(
                'Invite Status',
                provider.inviteStatus,
                Icons.check_circle_rounded,
                const Color(0x1F14B8A6),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Successful Referrals list
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Successful Referrals',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: Color(0xFF2C2C2C),
                ),
              ),
              Text(
                '${provider.successfulReferrals}/10 limit',
                style: const TextStyle(fontSize: 11, color: Color(0xFF707070)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (provider.referralsHistory.isEmpty) ...[
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'No referrals yet. Spread invites to earn rewards!',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ),
            ),
          ] else ...[
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: provider.referralsHistory.length,
              itemBuilder: (context, index) {
                final referral = provider.referralsHistory[index];
                return Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0x12C5A059)),
                  ),
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: const Color(
                        0xFFC5A059,
                      ).withValues(alpha: 0.15),
                      child: Text(
                        referral['avatar'] ?? 'U',
                        style: const TextStyle(
                          color: Color(0xFFC5A059),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(
                      referral['name'] ?? '',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                      ),
                    ),
                    subtitle: Text(
                      'Joined: ${referral['date']}',
                      style: const TextStyle(
                        fontSize: 10.5,
                        color: Color(0xFF707070),
                      ),
                    ),
                    trailing: Text(
                      '+₹${referral['amount'].toInt()}',
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
          const SizedBox(height: 20),

          // Spinning wheel embedded inside dashboard
          _buildEmbeddedSpinWheel(provider),
          const SizedBox(height: 20),

          // Loyalty rules card matching the web storefront policy
          _buildLoyaltyRulesCard(),
        ],
      ),
    );
  }


  Widget _buildLoyaltyRulesCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2C2C2C), Color(0xFF1A1A1A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFC5A059), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.gavel_rounded,
                color: Color(0xFFC5A059),
                size: 18,
              ),
              const SizedBox(width: 8),
              const Text(
                'ARHAM GOVERNANCE & RULES',
                style: TextStyle(
                  color: Color(0xFFC5A059),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Loyalty Program Policy',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Outfit',
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'To keep the Arham Ornaments community fair, rewards are distributed according to our secure promotions policy.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 11.5,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 16),

          // Rule 1
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFC5A059).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.history_toggle_off_rounded,
                  color: Color(0xFFC5A059),
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Monthly Invite Limit',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Rewards are credited for up to 10 successful referrals per month. Resets automatically on the 1st of every month.',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Rule 2
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFC5A059).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.wallet_giftcard_rounded,
                  color: Color(0xFFC5A059),
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Wallet Redemption Cap',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Loyalty rewards are valid for any catalog purchase. You can redeem up to ₹1,000 per order for maximum discount savings.',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 12),
          const Center(
            child: Text(
              'Management reserves the right to audit or adjust balances for verified signup activities.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white38,
                fontSize: 9.5,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AC5A059)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: Color(0xFF707070),
                  fontSize: 10.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                child: Icon(icon, size: 14, color: const Color(0xFFC5A059)),
              ),
            ],
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFF2C2C2C),
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmbeddedSpinWheel(StoreProvider provider) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x33C5A059)),
      ),
      child: Column(
        children: [
          const Text(
            '🎰 LUCKY SPIN WHEEL 🎰',
            style: TextStyle(
              color: Color(0xFFC5A059),
              fontSize: 13,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Spin once to unlock real cash and shopping discount coupons!',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF707070), fontSize: 10.5),
          ),
          const SizedBox(height: 20),

          if (provider.hasSpunWheel) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFDFBF7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x1AC5A059)),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.check_circle_outline_rounded,
                    color: Color(0xFFC5A059),
                    size: 36,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Spin Claimed Successfully!',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    provider.activeCouponCode != null
                        ? 'You won ₹${provider.walletBalance.toInt()} Wallet Credits and unlocked flat 5% off checkout coupon ${provider.activeCouponCode}!'
                        : 'Your lucky spin has been recorded. Check wallet ledger!',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Color(0xFF707070),
                      fontSize: 10.5,
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Stack(
              alignment: Alignment.center,
              children: [
                AnimatedBuilder(
                  animation: _animation,
                  builder: (context, child) {
                    return Transform.rotate(
                      angle: _animation.value,
                      child: CustomPaint(
                        size: const Size(200, 200),
                        painter: WheelPainter(_prizes, _prizeColors),
                      ),
                    );
                  },
                ),
                Positioned(
                  top: 0,
                  child: Container(
                    width: 0,
                    height: 0,
                    decoration: const BoxDecoration(
                      border: Border(
                        left: BorderSide(color: Colors.transparent, width: 8),
                        right: BorderSide(color: Colors.transparent, width: 8),
                        bottom: BorderSide(color: Colors.redAccent, width: 18),
                      ),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: _startSpinning,
                  child: Container(
                    height: 44,
                    width: 44,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: Colors.black26, blurRadius: 4),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        _isSpinning ? 'SPIN' : 'SPIN',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFC5A059),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isSpinning ? null : _startSpinning,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC5A059),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                _isSpinning ? 'SPINNING...' : 'SPIN NOW!',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // MY PROFILE SUB-VIEW (SCREEN 3)
  // ==========================================
  Widget _buildProfileTab(StoreProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _profileFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Personal Information',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    color: Color(0xFF2C2C2C),
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                // Edit toggle switch
                Row(
                  children: [
                    const Text(
                      'Edit Profile',
                      style: TextStyle(fontSize: 11, color: Color(0xFF707070)),
                    ),
                    Switch.adaptive(
                      value: _isEditingProfile,
                      activeThumbColor: const Color(0xFFC5A059),
                      onChanged: (val) {
                        setState(() {
                          _isEditingProfile = val;
                          if (!val) {
                            // Reset changes
                            _initProfileControllers();
                          }
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Form inputs
            _buildProfileField(
              'Full Name',
              _profileNameController,
              Icons.person_rounded,
            ),
            _buildProfileField(
              'Email Address',
              _profileEmailController,
              Icons.email_rounded,
            ),
            _buildProfileField(
              'Phone Number',
              _profilePhoneController,
              Icons.phone_rounded,
            ),
            _buildProfileField(
              'Street Address',
              _profileAddressController,
              Icons.home_rounded,
            ),
            _buildProfileField(
              'City',
              _profileCityController,
              Icons.location_city_rounded,
            ),
            _buildProfileField(
              'Pin Code',
              _profileZipController,
              Icons.pin_drop_rounded,
            ),
            const SizedBox(height: 20),

            // Save button
            if (_isEditingProfile) ...[
              ElevatedButton(
                onPressed: () {
                  if (!_profileFormKey.currentState!.validate()) return;
                  provider.updateProfileDetails(
                    _profileNameController.text.trim(),
                    _profileEmailController.text.trim(),
                    _profilePhoneController.text.trim(),
                    _profileAddressController.text.trim(),
                    _profileCityController.text.trim(),
                    _profileZipController.text.trim(),
                  );
                  setState(() {
                    _isEditingProfile = false;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Profile information updated successfully!',
                      ),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC5A059),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'SAVE CHANGES',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Bottom Panel Card: Your referral code display
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFDFBF7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0x33C5A059)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'YOUR REFERRAL CODE',
                    style: TextStyle(
                      color: Color(0xFFC5A059),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        provider.userReferralCode,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          letterSpacing: 1.5,
                          color: Color(0xFF2C2C2C),
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(
                              Icons.copy,
                              size: 18,
                              color: Color(0xFFC5A059),
                            ),
                            onPressed: () {
                              Clipboard.setData(
                                ClipboardData(text: provider.userReferralCode),
                              );
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Referral code copied!'),
                                ),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(
                              Icons.share_rounded,
                              size: 18,
                              color: Color(0xFFC5A059),
                            ),
                            onPressed: () {
                              Share.share(
                                "Join Arham Ornaments today and get ₹100 instant credits! ✨\n\nUse my referral code: ${provider.userReferralCode}\n\nSign up here: https://www.arhamornaments.com/?ref=${provider.userReferralCode}",
                                subject: "Arham Ornaments Invitation",
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Share this code to earn ₹100 per successful referral.',
                    style: TextStyle(fontSize: 11, color: Color(0xFF707070)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileField(
    String label,
    TextEditingController controller,
    IconData icon,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
      child: TextFormField(
        controller: controller,
        enabled: _isEditingProfile,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: const Color(0xFFC5A059), size: 20),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0x1AC5A059)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFC5A059), width: 1.5),
          ),
        ),
        validator: (val) {
          if (val == null || val.trim().isEmpty) return 'Field cannot be empty';
          return null;
        },
      ),
    );
  }

  // ==========================================
  // NOTIFICATIONS SUB-VIEW (SCREEN 4)
  // ==========================================
  Widget _buildNotificationsTab(StoreProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Sidebar User Card header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x1AC5A059)),
              boxShadow: const [
                BoxShadow(color: Color(0x05000000), blurRadius: 4),
              ],
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: const Color(0xFFC5A059),
                  child: Text(
                    provider.userName.substring(0, 1).toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        provider.userName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13.5,
                        ),
                      ),
                      Text(
                        provider.userEmail,
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 10.5,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF9EE),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: const Color(0xFFC5A059),
                      width: 0.6,
                    ),
                  ),
                  child: Text(
                    '₹${provider.walletBalance.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: Color(0xFFC5A059),
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'Dynamic Notifications Feed',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: Color(0xFF2C2C2C),
            ),
          ),
          const SizedBox(height: 10),

          if (provider.notificationsList.isEmpty) ...[
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: Text(
                  'No active notifications at this moment.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ),
            ),
          ] else ...[
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: provider.notificationsList.length,
              itemBuilder: (context, index) {
                final notification = provider.notificationsList[index];
                final bool isUnread = !(notification['read'] ?? true);
                final String? link = notification['link'];

                Widget card = Card(
                  elevation: 0,
                  color: isUnread ? const Color(0xFFFFFDF9) : Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(
                      color: isUnread
                          ? const Color(0x6BC5A059)
                          : const Color(0x12C5A059),
                    ),
                  ),
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      border: isUnread
                          ? const Border(
                              left: BorderSide(
                                color: Color(0xFFC5A059),
                                width: 3.5,
                              ),
                            )
                          : null,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  notification['title'] ?? '',
                                  style: TextStyle(
                                    fontWeight: isUnread
                                        ? FontWeight.bold
                                        : FontWeight.w600,
                                    fontSize: 13,
                                    color: const Color(0xFF2C2C2C),
                                  ),
                                ),
                              ),
                              Text(
                                notification['date'] ?? '',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            notification['description'] ?? '',
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFF555555),
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );

                if (link != null && link.isNotEmpty) {
                  return GestureDetector(
                    onTap: () => _handleNotificationLink(link),
                    child: card,
                  );
                }
                return card;
              },
            ),
          ],
        ],
      ),
    );
  }

  // ==========================================
  // WALLET & REWARDS SUB-VIEW (SCREEN 5)
  // ==========================================
  Widget _buildWalletTab(StoreProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Sidebar User Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x1AC5A059)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: const Color(0xFFC5A059),
                  child: Text(
                    provider.userName.substring(0, 1).toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        provider.userName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        '${provider.successfulReferrals} active referrals',
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFCFAF6),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Tier: Elite',
                    style: TextStyle(
                      color: Color(0xFFC5A059),
                      fontWeight: FontWeight.bold,
                      fontSize: 9.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Two reward cards side-by-side or stacked
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 500;
              final cards = [
                // Card 1: golden-orange Wallet Balance
                Expanded(
                  flex: isWide ? 1 : 0,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFE68A00), Color(0xFFFFB366)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x1AE68A00),
                          blurRadius: 6,
                          offset: Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'WALLET BALANCE',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '₹${provider.walletBalance.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Redeems on shopping cart up to ₹1,000!',
                          style: TextStyle(color: Colors.white70, fontSize: 9),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(width: isWide ? 12 : 0, height: isWide ? 0 : 12),
                // Card 2: green Referral Earnings
                Expanded(
                  flex: isWide ? 1 : 0,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B8A5A), Color(0xFF2ECD8A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x1A1B8A5A),
                          blurRadius: 6,
                          offset: Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'REFERRAL EARNINGS',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '₹${provider.referralEarnings.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Earned through invite code program.',
                          style: TextStyle(color: Colors.white70, fontSize: 9),
                        ),
                      ],
                    ),
                  ),
                ),
              ];

              if (isWide) {
                return Row(children: cards);
              } else {
                return Column(
                  children: cards
                      .map((c) => c is Expanded ? c.child : c)
                      .toList(),
                );
              }
            },
          ),
          const SizedBox(height: 24),

          // Transaction ledger history
          const Text(
            'Transaction History',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: Color(0xFF2C2C2C),
            ),
          ),
          const SizedBox(height: 10),

          if (provider.transactionsHistory.isEmpty) ...[
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'No transaction logs yet.',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ),
            ),
          ] else ...[
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: provider.transactionsHistory.length,
              itemBuilder: (context, index) {
                final tx = provider.transactionsHistory[index];
                IconData typeIcon = Icons.add_circle_outline_rounded;
                Color typeColor = Colors.green;

                if (tx['type'] == 'spin') {
                  typeIcon = Icons.stars_rounded;
                  typeColor = const Color(0xFFC5A059);
                } else if (tx['type'] == 'welcome') {
                  typeIcon = Icons.card_giftcard_rounded;
                  typeColor = Colors.orange;
                }

                return Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0x12C5A059)),
                  ),
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: typeColor.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(typeIcon, color: typeColor, size: 18),
                    ),
                    title: Text(
                      tx['title'] ?? '',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12.5,
                      ),
                    ),
                    subtitle: Text(
                      tx['date'] ?? '',
                      style: const TextStyle(
                        fontSize: 10.5,
                        color: Color(0xFF707070),
                      ),
                    ),
                    trailing: Text(
                      '+₹${tx['amount'].toInt()}',
                      style: TextStyle(
                        color: typeColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              },
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
  final List<Color> colors;

  WheelPainter(this.prizes, this.colors);

  @override
  void paint(Canvas canvas, Size size) {
    final double radius = size.width / 2;
    final Paint paint = Paint()..style = PaintingStyle.fill;
    final double angle = 2 * math.pi / prizes.length;

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
            fontSize: 9.5,
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
      textPainter.paint(
        canvas,
        Offset(-textPainter.width / 2, -textPainter.height / 2),
      );
      canvas.restore();
    }

    // Outer circle border decoration
    final borderPaint = Paint()
      ..color = const Color(0xFFC5A059)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    canvas.drawCircle(Offset(radius, radius), radius, borderPaint);

    // Inner pin ring
    paint.color = const Color(0xFFD4AF37);
    canvas.drawCircle(Offset(radius, radius), 14, paint);
    paint.color = Colors.white;
    canvas.drawCircle(Offset(radius, radius), 5, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
