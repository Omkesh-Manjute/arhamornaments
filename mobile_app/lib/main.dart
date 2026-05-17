import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'providers/store_provider.dart';
import 'screens/home_screen.dart';
import 'screens/shop_screen.dart';
import 'screens/wishlist_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/profile_screen.dart';

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
            onCategorySelect: (category) {
              setState(() {
                _selectedCategory = category;
              });
            },
          ),
          ShopScreen(
            provider: _storeProvider,
            initialCategory: _selectedCategory,
          ),
          WishlistScreen(
            provider: _storeProvider,
            onTabChange: (index) {
              setState(() {
                _currentIndex = index;
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
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.transparent,
            title: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.filter_vintage_rounded, color: Color(0xFFC5A059), size: 20),
                SizedBox(width: 8),
                Text(
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
                NavigationDestination(
                  icon: Badge(
                    label: Text('${_storeProvider.wishlistItems.length}'),
                    isLabelVisible: _storeProvider.wishlistItems.isNotEmpty,
                    child: const Icon(Icons.favorite_border_rounded),
                  ),
                  selectedIcon: const Icon(Icons.favorite_rounded),
                  label: 'Wishlist',
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
