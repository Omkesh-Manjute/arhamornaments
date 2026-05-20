import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:url_launcher/url_launcher.dart';
import 'firebase_options.dart';
import 'services/notification_service.dart';
import 'providers/store_provider.dart';
import 'screens/home_screen.dart';
import 'screens/shop_screen.dart';
import 'screens/wishlist_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/lucky_wheel_dialog.dart';
import 'screens/categories_screen.dart';
import 'screens/contact_us_screen.dart';
import 'screens/privacy_policy_screen.dart';
import 'widgets/ornaments_accordion_filter.dart';
import 'widgets/custom_logo_loader.dart';
import 'widgets/arham_app_bar.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Register the background message handler
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  // Initialize the notification service
  await NotificationService().initialize();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Arham Ornaments',
      scrollBehavior: const LuxuryScrollBehavior(),
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFFCFAF6), // Luxurious clean warm background
        primaryColor: const Color(0xFFC5A059),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFC5A059),
          primary: const Color(0xFFC5A059),
          secondary: const Color(0xFF2C2C2C),
        ),
        useMaterial3: true,
      ),
      debugShowCheckedModeBanner: false,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  final StoreProvider _storeProvider = StoreProvider();
  int _currentIndex = 0;
  String _selectedCategory = 'All';
  String _searchQuery = '';
  FilterState _activeFilterState = const FilterState();
  bool _showSplash = true;

  @override
  void initState() {
    super.initState();
    _storeProvider.loadPersistentState();
    
    // Animate and fade out luxury 3D splash after 2500ms
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() {
          _showSplash = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _storeProvider,
      builder: (context, _) {
        if (_showSplash) {
          return Scaffold(
            backgroundColor: const Color(0xFF0B132B), // Premium luxury dark navy backing
            body: Stack(
              children: [
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: RadialGradient(
                        colors: [
                          const Color(0xFF1B263B), // Elegant navy center
                          const Color(0xFF0B132B), // Very deep navy edge
                        ],
                        radius: 1.3,
                      ),
                    ),
                  ),
                ),
                const Center(
                  child: CustomLogoLoader(size: 120), // Premium enlarged loader centered in place
                ),
              ],
            ),
          );
        }
        final List<Widget> screens = [
          HomeScreen(
            provider: _storeProvider,
            onTabChange: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            onCategorySelect: (category, {search, collection}) {
              setState(() {
                _selectedCategory = category;
                _searchQuery = search ?? '';
                if (collection != null) {
                  _activeFilterState = FilterState(
                    categories: category != 'All' ? [category] : [],
                    collections: [collection],
                  );
                } else {
                  _activeFilterState = FilterState(
                    categories: category != 'All' ? [category] : [],
                  );
                }
                _currentIndex = 1; // Direct to Shop
              });
            },
          ),
          ShopScreen(
            provider: _storeProvider,
            initialCategory: _selectedCategory,
            initialSearch: _searchQuery,
            initialFilterState: _activeFilterState,
          ),
          CategoriesScreen(
            provider: _storeProvider,
            onApplyFilters: (filterState) {
              setState(() {
                _activeFilterState = filterState;
                _selectedCategory = filterState.categories.isNotEmpty
                    ? filterState.categories.first
                    : 'All';
                _searchQuery = '';
                _currentIndex = 1; // Direct to Shop
              });
            },
          ),
          CartScreen(
            provider: _storeProvider,
            onTabChange: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
          ),
          ProfileScreen(
            provider: _storeProvider,
          ),
        ];

        return Scaffold(
          drawer: _buildMainDrawer(context),
          appBar: ArhamAppBar(
            provider: _storeProvider,
            showHamburger: _currentIndex == 0,
            onWishlistTap: () => _openWishlist(context),
          ),
          body: SafeArea(
            child: IndexedStack(
              index: _currentIndex,
              children: screens,
            ),
          ),
          bottomNavigationBar: NavigationBarTheme(
            data: NavigationBarThemeData(
              indicatorColor: const Color(0xFFFDFBF7),
              labelTextStyle: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return const TextStyle(color: Color(0xFFC5A059), fontSize: 11, fontWeight: FontWeight.bold);
                }
                return const TextStyle(color: Color(0xFF707070), fontSize: 11);
              }),
              iconTheme: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return const IconThemeData(color: Color(0xFFC5A059), size: 24);
                }
                return const IconThemeData(color: Color(0xFF707070), size: 22);
              }),
            ),
            child: NavigationBar(
              backgroundColor: Colors.white,
              selectedIndex: _currentIndex,
              onDestinationSelected: (index) {
                setState(() {
                  _currentIndex = index;
                  // Reset search queries and categories when switching tabs explicitly
                  if (index != 1) {
                    _searchQuery = '';
                  }
                });
              },
              destinations: [
                const NavigationDestination(
                  icon: Icon(Icons.home_outlined),
                  selectedIcon: Icon(Icons.home_rounded),
                  label: 'Home',
                ),
                const NavigationDestination(
                  icon: Icon(Icons.search_outlined),
                  selectedIcon: Icon(Icons.search_rounded),
                  label: 'Shop',
                ),
                const NavigationDestination(
                  icon: Icon(Icons.grid_view_outlined),
                  selectedIcon: Icon(Icons.grid_view_rounded),
                  label: 'Categories',
                ),
                NavigationDestination(
                  icon: Badge(
                    label: Text('${_storeProvider.cartCount}'),
                    isLabelVisible: _storeProvider.cartCount > 0,
                    child: const Icon(Icons.shopping_bag_outlined),
                  ),
                  selectedIcon: const Icon(Icons.shopping_bag_rounded),
                  label: 'Basket',
                ),
                const NavigationDestination(
                  icon: Icon(Icons.account_circle_outlined),
                  selectedIcon: Icon(Icons.account_circle_rounded),
                  label: 'Profile',
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMainDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFFFCFAF6),
      child: Column(
        children: [
          // ── Slim Greeting Header (no logo, no email) ─────────
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF111827), Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            padding: const EdgeInsets.fromLTRB(20, 48, 20, 18),
            child: Text(
              _storeProvider.isLoggedIn
                  ? 'Hi ${_storeProvider.userName}!'
                  : 'Hi Guest!',
              style: const TextStyle(
                fontFamily: 'Outfit',
                fontWeight: FontWeight.bold,
                fontSize: 22,
                color: Color(0xFFC5A059),
              ),
            ),
          ),

          // ── Live Metal Rates Card (directly below header) ─────
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFFDF9), Color(0xFFFFF9EE)],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0x55C5A059), width: 1),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0A000000),
                    blurRadius: 8,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFC5A059),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'LIVE RATES',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.show_chart_rounded, color: Color(0xFFC5A059), size: 14),
                      ],
                    ),
                  ),
                  _buildDrawerRateRow('22KT Gold', _storeProvider.gold22Rate, '/g', const Color(0xFFD4AF37)),
                  _buildDrawerRateRow('24KT Gold', _storeProvider.gold24Rate, '/g', const Color(0xFFFFD700)),
                  _buildDrawerRateRow('Silver', _storeProvider.silverRate, '/g', const Color(0xFFA0A0A0)),
                  if (_storeProvider.silver1kgRate > 0)
                    _buildDrawerRateRow('Silver 1 kg', _storeProvider.silver1kgRate, '/kg', const Color(0xFFC0C0C0)),
                  if (_storeProvider.platinumRate > 0)
                    _buildDrawerRateRow('Platinum', _storeProvider.platinumRate, '/g', const Color(0xFF9B9B9B)),
                  if (_storeProvider.ratesLastUpdated != null)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 4, 14, 10),
                      child: Text(
                        'Updated: ${_formatRateTime(_storeProvider.ratesLastUpdated!)}',
                        style: const TextStyle(
                          color: Color(0xFFA0A0A0),
                          fontSize: 9,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    )
                  else
                    const SizedBox(height: 10),
                ],
              ),
            ),
          ),

          // ── Virtual Wallet & Lucky Spin ───────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFFDF9), Color(0xFFFFF9EE)],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0x6BC5A059), width: 1.2),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0A000000),
                    blurRadius: 8,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'MY WALLET',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFC5A059),
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${_storeProvider.walletBalance.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF111827),
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context); // Close drawer
                      LuckyWheelDialog.show(context, _storeProvider);
                    },
                    icon: const Icon(Icons.stars_rounded, size: 14),
                    label: const Text('SPIN & WIN', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFC5A059),
                      foregroundColor: Colors.white,
                      elevation: 1,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Drawer Navigation Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              children: [
                ListTile(
                  leading: const Icon(Icons.grid_view_rounded, color: Color(0xFFC5A059), size: 20),
                  title: const Text(
                    'All Jewellery Store',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded, color: Colors.black26, size: 18),
                  onTap: () {
                    setState(() {
                      _selectedCategory = 'All';
                      _searchQuery = '';
                      _currentIndex = 1;
                    });
                    Navigator.pop(context);
                  },
                ),

                // Metal Submenu
                ExpansionTile(

                  leading: const Icon(Icons.auto_awesome_rounded, color: Color(0xFFC5A059), size: 20),
                  title: const Text(
                    'Browse Metal',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  iconColor: const Color(0xFFC5A059),
                  collapsedIconColor: Colors.black38,
                  childrenPadding: EdgeInsets.zero,
                  children: [
                    _buildSubcategoryItem(context, 'Gold Jewellery', 'Gold'),
                    _buildSubcategoryItem(context, 'Silver Jewellery', 'Silver'),
                    _buildSubcategoryItem(context, 'Diamond Jewellery', 'Diamond'),
                  ],
                ),

                // Collections Submenu
                ExpansionTile(
                  leading: const Icon(Icons.collections_bookmark_rounded, color: Color(0xFFC5A059), size: 20),
                  title: const Text(
                    'Collections',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  iconColor: const Color(0xFFC5A059),
                  collapsedIconColor: Colors.black38,
                  children: [
                    _buildSubcategoryItem(context, 'Bridal Masterpieces', 'Bridal'),
                    _buildSubcategoryItem(context, 'Antique Heritage', 'Antique'),
                    _buildSubcategoryItem(context, 'Everyday Premium Wear', 'Everyday'),
                  ],
                ),

                // Gender Submenu
                ExpansionTile(
                  leading: const Icon(Icons.people_alt_rounded, color: Color(0xFFC5A059), size: 20),
                  title: const Text(
                    'Gender Store',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  iconColor: const Color(0xFFC5A059),
                  collapsedIconColor: Colors.black38,
                  children: [
                    _buildSubcategoryItem(context, "Men's Collection", 'Men'),
                    _buildSubcategoryItem(context, "Women's Collection", 'Women'),
                  ],
                ),

                // Main Jewelry Categories
                ExpansionTile(
                  leading: const Icon(Icons.category_rounded, color: Color(0xFFC5A059), size: 20),
                  title: const Text(
                    'Jewelry Categories',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  iconColor: const Color(0xFFC5A059),
                  collapsedIconColor: Colors.black38,
                  children: [
                    _buildCategoryItem(context, 'Necklaces'),
                    _buildCategoryItem(context, 'Earrings'),
                    _buildCategoryItem(context, 'Rings'),
                    _buildCategoryItem(context, 'Mangalsutras'),
                    _buildCategoryItem(context, 'Chains'),
                    _buildCategoryItem(context, 'Bangles'),
                  ],
                ),

                const Divider(color: Color(0x1AC5A059), height: 32),

                ListTile(
                  leading: const Icon(Icons.phone_in_talk_rounded, color: Colors.green, size: 20),
                  title: const Text(
                    'Direct Sales Support',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _callSupport();
                  },
                ),

                ListTile(
                  leading: const Icon(Icons.storefront_rounded, color: Color(0xFFC5A059), size: 20),
                  title: const Text(
                    'Contact Us',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  onTap: () {
                    Navigator.pop(context); // close drawer
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ContactUsScreen(),
                      ),
                    );
                  },
                ),

                ListTile(
                  leading: const Icon(Icons.policy_rounded, color: Color(0xFFC5A059), size: 20),
                  title: const Text(
                    'Privacy Policy',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF2C2C2C)),
                  ),
                  onTap: () {
                    Navigator.pop(context); // close drawer
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PrivacyPolicyScreen(provider: _storeProvider),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerRateRow(String label, double rate, String unit, Color dotColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                color: Color(0xFF4A4A4A),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Text(
            '₹${rate.toStringAsFixed(0)}$unit',
            style: const TextStyle(
              color: Color(0xFFC5A059),
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  String _formatRateTime(DateTime dt) {
    final hour = dt.hour > 12 ? dt.hour - 12 : dt.hour == 0 ? 12 : dt.hour;
    final minute = dt.minute.toString().padLeft(2, '0');
    final ampm = dt.hour >= 12 ? 'PM' : 'AM';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '$hour:$minute $ampm, ${dt.day} ${months[dt.month - 1]}';
  }

  Widget _buildSubcategoryItem(BuildContext context, String title, String searchKey) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 32, right: 16),
      title: Text(
        title,
        style: const TextStyle(fontSize: 12, color: Color(0xFF555555)),
      ),
      dense: true,
      onTap: () {
        setState(() {
          _selectedCategory = 'All';
          _searchQuery = searchKey;
          _currentIndex = 1; // Shop
        });
        Navigator.pop(context);
      },
    );
  }

  Widget _buildCategoryItem(BuildContext context, String categoryName) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 32, right: 16),
      title: Text(
        categoryName,
        style: const TextStyle(fontSize: 12, color: Color(0xFF555555)),
      ),
      dense: true,
      onTap: () {
        setState(() {
          _selectedCategory = categoryName;
          _searchQuery = '';
          _currentIndex = 1; // Shop
        });
        Navigator.pop(context);
      },
    );
  }

  void _openWishlist(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          backgroundColor: const Color(0xFFFCFAF6),
          appBar: ArhamAppBar(
            provider: _storeProvider,
            showHamburger: false,
            onWishlistTap: null, // already on wishlist, disable
          ),
          body: WishlistScreen(
            provider: _storeProvider,
            onTabChange: (index) {
              Navigator.pop(context);
              setState(() {
                _currentIndex = index;
              });
            },
          ),
        ),
      ),
    );
  }

  void _callSupport() async {
    final Uri tel = Uri.parse('tel:+919371504182');
    try {
      if (await canLaunchUrl(tel)) {
        await launchUrl(tel);
      } else {
        throw 'Could not launch dialer';
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Support line: +91 93715 04182'),
            backgroundColor: Color(0xFFC5A059),
          ),
        );
      }
    }
  }
}

class LuxuryScrollBehavior extends ScrollBehavior {
  const LuxuryScrollBehavior();

  @override
  Widget buildOverscrollIndicator(
      BuildContext context, Widget child, ScrollableDetails details) {
    return child;
  }

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    return const ClampingScrollPhysics();
  }
}
