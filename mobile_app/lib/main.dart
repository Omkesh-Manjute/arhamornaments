import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'providers/store_provider.dart';
import 'screens/home_screen.dart';
import 'screens/shop_screen.dart';
import 'screens/wishlist_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/lucky_wheel_dialog.dart';
import 'screens/categories_screen.dart';
import 'widgets/ornaments_accordion_filter.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Arham Ornaments',
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

  @override
  void initState() {
    super.initState();
    _storeProvider.loadPersistentState();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _storeProvider,
      builder: (context, _) {
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
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.transparent,
            iconTheme: const IconThemeData(color: Color(0xFFC5A059)), // Gold hamburger icon!
            title: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: Image.asset(
                    'assets/logo.jpg',
                    height: 24,
                    width: 24,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Icon(
                      Icons.filter_vintage_rounded,
                      color: Color(0xFFC5A059),
                      size: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'ARHAM ORNAMENTS',
                  style: TextStyle(
                    color: Color(0xFF2C2C2C),
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: Badge(
                  label: Text('${_storeProvider.wishlistItems.length}'),
                  isLabelVisible: _storeProvider.wishlistItems.isNotEmpty,
                  backgroundColor: const Color(0xFFC5A059),
                  textColor: Colors.white,
                  child: const Icon(Icons.favorite_border_rounded, color: Color(0xFFC5A059)),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => Scaffold(
                        backgroundColor: const Color(0xFFFCFAF6),
                        appBar: AppBar(
                          title: const Text(
                            'MY WISHLIST',
                            style: TextStyle(
                              color: Color(0xFF2C2C2C),
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          elevation: 0,
                          backgroundColor: Colors.white,
                          surfaceTintColor: Colors.transparent,
                          iconTheme: const IconThemeData(color: Color(0xFFC5A059)),
                          bottom: PreferredSize(
                            preferredSize: const Size.fromHeight(1.0),
                            child: Container(color: const Color(0x1AC5A059), height: 1.0),
                          ),
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
                },
              ),
              IconButton(
                icon: const Icon(Icons.support_agent_rounded, color: Color(0xFFC5A059)),
                onPressed: _callSupport,
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1.0),
              child: Container(color: const Color(0x1AC5A059), height: 1.0),
            ),
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
          // Elegant Drawer Header with Profile
          UserAccountsDrawerHeader(
            margin: EdgeInsets.zero,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF111827), Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            currentAccountPicture: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFC5A059), width: 2),
              ),
              child: CircleAvatar(
                backgroundColor: const Color(0xFFFCFAF6),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(40),
                  child: Image.asset(
                    'assets/logo.jpg',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Icon(
                      Icons.person_rounded,
                      color: Color(0xFFC5A059),
                      size: 40,
                    ),
                  ),
                ),
              ),
            ),
            accountName: Text(
              _storeProvider.isLoggedIn ? 'Hi ${_storeProvider.userName}!' : 'Hi Guest!',
              style: const TextStyle(
                fontFamily: 'Outfit',
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: Color(0xFFC5A059),
              ),
            ),
            accountEmail: Text(
              _storeProvider.isLoggedIn ? _storeProvider.userEmail : 'Welcome to Arham Ornaments',
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ),

          // Virtual Wallet & Lucky Spin Promotion Panel
          Padding(
            padding: const EdgeInsets.all(12.0),
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
              ],
            ),
          ),
        ],
      ),
    );
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

  void _callSupport() async {
    final Uri tel = Uri.parse('tel:+919833216777');
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
            content: Text('Support line: +91 98332 16777'),
            backgroundColor: Color(0xFFC5A059),
          ),
        );
      }
    }
  }
}
