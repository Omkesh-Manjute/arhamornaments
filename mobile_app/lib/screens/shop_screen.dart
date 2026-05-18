import 'dart:async';
import 'package:flutter/material.dart';
import '../models/product.dart';
import '../providers/store_provider.dart';
import '../widgets/product_detail_sheet.dart';
import '../widgets/ornaments_accordion_filter.dart';
import '../widgets/custom_logo_loader.dart';

class ShopScreen extends StatefulWidget {
  final StoreProvider provider;
  final String initialCategory; // Supports navigating from home category selections
  final String initialSearch; // Supports search filters from the drawer menu
  final FilterState initialFilterState;

  const ShopScreen({
    super.key,
    required this.provider,
    required this.initialCategory,
    this.initialSearch = '',
    this.initialFilterState = const FilterState(),
  });

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  late String _selectedCategory;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  // Advanced Sorting & Filtering State
  String _sortBy = 'Best Selling';
  late FilterState _filterState;
  
  bool _isListingLoading = false;
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _searchQuery = widget.initialSearch;
    _searchController.text = widget.initialSearch;
    _filterState = widget.initialFilterState;
    if (_selectedCategory != 'All' && !_filterState.categories.contains(_selectedCategory)) {
      _filterState = _filterState.copyWith(categories: [_selectedCategory]);
    }

    // Trigger premium listing load simulation for initial build
    _isListingLoading = true;
    Future.delayed(const Duration(milliseconds: 650), () {
      if (mounted) {
        setState(() {
          _isListingLoading = false;
        });
      }
    });
  }

  @override
  void didUpdateWidget(covariant ShopScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    bool changed = false;

    if (widget.initialCategory != oldWidget.initialCategory || widget.initialCategory != _selectedCategory) {
      _selectedCategory = widget.initialCategory;
      changed = true;
    }

    if (widget.initialSearch != oldWidget.initialSearch || widget.initialSearch != _searchQuery) {
      _searchQuery = widget.initialSearch;
      _searchController.text = widget.initialSearch;
      changed = true;
    }

    if (widget.initialFilterState != oldWidget.initialFilterState) {
      _filterState = widget.initialFilterState;
      changed = true;
    } else if (changed) {
      // Sync selected category into filter state if the category changed but not the filter state itself
      if (_selectedCategory != 'All') {
        if (!_filterState.categories.contains(_selectedCategory)) {
          _filterState = _filterState.copyWith(categories: [_selectedCategory]);
        }
      } else {
        _filterState = _filterState.copyWith(categories: []);
      }
    }

    if (changed) {
      _triggerListingLoad(ms: 500);
    }
  }

  void _triggerListingLoad({int ms = 500}) {
    setState(() {
      _isListingLoading = true;
    });
    Future.delayed(Duration(milliseconds: ms), () {
      if (mounted) {
        setState(() {
          _isListingLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchDebounce?.cancel();
    super.dispose();
  }

  bool _hasActiveFilters() {
    return !_filterState.isEmpty;
  }

  void _showSortSheet() {
    final List<String> sortOptions = [
      'Best Selling',
      'Most Popular',
      'Price: Low to High',
      'Price: High to Low',
      'Newest First',
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 20, 20, 12),
                child: Text(
                  'SORT BY',
                  style: TextStyle(
                    color: Color(0xFF2C2C2C),
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
              const Divider(color: Color(0xFFF0EAE1)),
              // Options
              ...sortOptions.map((opt) {
                final bool isSelected = _sortBy == opt;
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 2),
                  leading: Icon(
                    isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                    color: const Color(0xFFC5A059),
                  ),
                  title: Text(
                    opt,
                    style: TextStyle(
                      color: isSelected ? const Color(0xFF2C2C2C) : const Color(0xFF707070),
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 14,
                    ),
                  ),
                  onTap: () {
                    setState(() {
                      _sortBy = opt;
                    });
                    _triggerListingLoad(ms: 450);
                    Navigator.pop(context);
                  },
                );
              }),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent, // Transparent so the outer container styling renders perfectly
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            // Get physical screen dimensions
            final double statusBarHeight = MediaQuery.of(context).viewPadding.top;
            final double sheetHeight = MediaQuery.of(context).size.height - (statusBarHeight + kToolbarHeight);

            return Container(
              height: sheetHeight,
              decoration: const BoxDecoration(
                color: Color(0xFFFCFAF6),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: Column(
                  children: [
                    // Elegant Header Row
                    Container(
                      padding: const EdgeInsets.fromLTRB(20, 20, 12, 12),
                      color: Colors.white,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'FILTER ORNAMENTS',
                                style: TextStyle(
                                  color: Color(0xFF2C2C2C),
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'REFINE YOUR SELECTION',
                                style: TextStyle(
                                  color: Color(0xFFC5A059),
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, color: Color(0xFFC5A059)),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                    ),
                    Container(color: const Color(0x1AC5A059), height: 1.0),
                    // Reusable Accordion Filter Widget
                    Expanded(
                      child: OrnamentsAccordionFilter(
                        state: _filterState,
                        showApplyButton: true,
                        onChanged: (newState) {
                          setSheetState(() {
                            _filterState = newState;
                          });
                        },
                        onApply: () {
                          _triggerListingLoad(ms: 500);
                          Navigator.pop(context);
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    // Check for major initial database load
    if (widget.provider.products.isEmpty && widget.provider.isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFFCFAF6),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CustomLogoLoader(size: 95),
              const SizedBox(height: 24),
              const Text(
                'RETRIEVING EXQUISITE COLLECTIONS',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  color: Color(0xFFC5A059),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2.0,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // 1. Dynamic filtering logic
    final List<Product> filteredProducts = widget.provider.products.where((product) {
      final double price = widget.provider.getProductPrice(product);

      // 1. Category filter
      bool matchesCategory = true;
      if (_filterState.categories.isNotEmpty) {
        matchesCategory = _filterState.categories.any((cat) {
          if (product.category.toLowerCase() == cat.toLowerCase()) return true;
          final nameLower = product.name.toLowerCase();
          final descLower = product.description.toLowerCase();
          final catLower = cat.toLowerCase();
          if (catLower == 'bangles' && (nameLower.contains('bangle') || nameLower.contains('kada'))) return true;
          if (catLower == 'kadas' && nameLower.contains('kada')) return true;
          if (catLower == 'necklaces' && (nameLower.contains('necklace') || nameLower.contains('thushi') || nameLower.contains('choker'))) return true;
          if (catLower == 'mangalsutra' && nameLower.contains('mangalsutra')) return true;
          if (catLower == 'rings' && nameLower.contains('ring')) return true;
          if (catLower == 'chains' && nameLower.contains('chain')) return true;
          if (catLower == 'earrings' && (nameLower.contains('earring') || nameLower.contains('jhumka') || nameLower.contains('bali'))) return true;
          return nameLower.contains(catLower) || descLower.contains(catLower);
        });
      }

      // 2. Search query filter
      bool matchesSearch = false;
      final String queryLower = _searchQuery.trim().toLowerCase();
      if (queryLower.isEmpty) {
        matchesSearch = true;
      } else {
        final String nameLower = product.name.toLowerCase();
        final String descLower = product.description.toLowerCase();
        final String catLower = product.category.toLowerCase();
        final String purityLower = product.purity.toLowerCase();

        if (queryLower == 'men' || queryLower == 'men\'s' || queryLower == 'mens') {
          final bool hasMen = nameLower.contains('men') || descLower.contains('men') || nameLower.contains('male') || descLower.contains('male') || nameLower.contains('gent') || descLower.contains('gent');
          final bool hasWomen = nameLower.contains('women') || descLower.contains('women') || nameLower.contains('lady') || descLower.contains('lady') || nameLower.contains('ladies') || descLower.contains('ladies') || nameLower.contains('girl') || descLower.contains('girl');
          matchesSearch = (hasMen && !hasWomen) || nameLower.contains('gent') || descLower.contains('gent') || nameLower.contains('male') || descLower.contains('male');
        } else if (queryLower == 'women' || queryLower == 'women\'s' || queryLower == 'womens') {
          final bool hasWomen = nameLower.contains('women') || descLower.contains('women') || nameLower.contains('lady') || descLower.contains('lady') || nameLower.contains('ladies') || descLower.contains('ladies') || nameLower.contains('girl') || descLower.contains('girl');
          matchesSearch = hasWomen;
        } else if (queryLower == 'kids' || queryLower == 'kid\'s' || queryLower == 'kids jewellery') {
          matchesSearch = nameLower.contains('kids') || descLower.contains('kids') || nameLower.contains('child') || descLower.contains('child') || nameLower.contains('baby') || descLower.contains('baby');
        } else {
          matchesSearch = nameLower.contains(queryLower) || 
              descLower.contains(queryLower) ||
              catLower.contains(queryLower) ||
              purityLower.contains(queryLower);
        }
      }

      // 3. Material filter
      bool matchesMaterial = true;
      if (_filterState.materials.isNotEmpty) {
        matchesMaterial = _filterState.materials.any((mat) {
          final nameLower = product.name.toLowerCase();
          final descLower = product.description.toLowerCase();
          final purityLower = product.purity.toLowerCase();
          final matLower = mat.toLowerCase();
          if (matLower == 'gold') {
            return purityLower.contains('gold') || purityLower.contains('kt') || purityLower.contains('k') || nameLower.contains('gold') || descLower.contains('gold');
          }
          return nameLower.contains(matLower) || descLower.contains(matLower) || purityLower.contains(matLower);
        });
      }

      // 4. Collection filter
      bool matchesCollection = true;
      if (_filterState.collections.isNotEmpty) {
        matchesCollection = _filterState.collections.any((col) {
          final nameLower = product.name.toLowerCase();
          final descLower = product.description.toLowerCase();
          final colLower = col.toLowerCase();
          if (colLower.contains('men') && !colLower.contains('women')) {
            final bool hasMen = nameLower.contains('men') || descLower.contains('men') || nameLower.contains('male') || descLower.contains('male') || nameLower.contains('gent') || descLower.contains('gent');
            final bool hasWomen = nameLower.contains('women') || descLower.contains('women') || nameLower.contains('lady') || descLower.contains('lady') || nameLower.contains('ladies') || descLower.contains('ladies') || nameLower.contains('girl') || descLower.contains('girl');
            return (hasMen && !hasWomen) || nameLower.contains('gent') || descLower.contains('gent') || nameLower.contains('male') || descLower.contains('male');
          }
          if (colLower.contains('women')) {
            return nameLower.contains('women') || descLower.contains('women') || nameLower.contains('lady') || descLower.contains('lady') || nameLower.contains('ladies') || descLower.contains('ladies') || nameLower.contains('girl') || descLower.contains('girl') || nameLower.contains('wati') || descLower.contains('wati');
          }
          if (colLower.contains('kid')) {
            return nameLower.contains('kids') || descLower.contains('kids') || nameLower.contains('child') || descLower.contains('child') || nameLower.contains('baby') || descLower.contains('baby');
          }
          if (colLower.contains('unisex')) {
            return nameLower.contains('unisex') || descLower.contains('unisex') || nameLower.contains('couple') || descLower.contains('couple');
          }
          return false;
        });
      }

      // 5. Occasion filter
      bool matchesOccasion = true;
      if (_filterState.occasions.isNotEmpty) {
        matchesOccasion = _filterState.occasions.any((occ) {
          final nameLower = product.name.toLowerCase();
          final descLower = product.description.toLowerCase();
          final occLower = occ.toLowerCase();
          if (occLower == 'bridal') {
            return nameLower.contains('bridal') || descLower.contains('wedding') || nameLower.contains('wedding') || descLower.contains('bridal');
          }
          if (occLower == 'daily wear') {
            return nameLower.contains('daily') || descLower.contains('daily') || nameLower.contains('casual') || descLower.contains('casual') || nameLower.contains('lightweight') || descLower.contains('lightweight');
          }
          if (occLower == 'party wear') {
            return nameLower.contains('cocktail') || descLower.contains('cocktail') || nameLower.contains('party') || descLower.contains('party') || nameLower.contains('grand') || descLower.contains('grand');
          }
          if (occLower == 'gifting') {
            return nameLower.contains('gift') || descLower.contains('gift') || nameLower.contains('present') || descLower.contains('present');
          }
          return nameLower.contains(occLower) || descLower.contains(occLower);
        });
      }

      // 6. Price range filter
      bool matchesPriceRange = true;
      if (_filterState.priceRanges.isNotEmpty) {
        matchesPriceRange = _filterState.priceRanges.any((range) {
          if (range == 'Under ₹10,000') {
            return price < 10000;
          } else if (range == '₹10,000 – ₹25,000') {
            return price >= 10000 && price <= 25000;
          } else if (range == '₹25,000 – ₹50,000') {
            return price >= 25000 && price <= 50000;
          } else if (range == '₹50,000 – ₹1,00,000') {
            return price >= 50000 && price <= 100000;
          } else if (range == 'Above ₹1,00,000') {
            return price > 100000;
          }
          return true;
        });
      }

      return matchesCategory && matchesSearch && matchesMaterial && matchesCollection && matchesOccasion && matchesPriceRange;
    }).toList();

    // 2. High-Performance Sort Logic
    if (_sortBy == 'Price: Low to High') {
      filteredProducts.sort((a, b) => widget.provider.getProductPrice(a).compareTo(widget.provider.getProductPrice(b)));
    } else if (_sortBy == 'Price: High to Low') {
      filteredProducts.sort((a, b) => widget.provider.getProductPrice(b).compareTo(widget.provider.getProductPrice(a)));
    } else if (_sortBy == 'Newest First') {
      filteredProducts.sort((a, b) => (b.isNewArrival ? 1 : 0).compareTo(a.isNewArrival ? 1 : 0));
    } else if (_sortBy == 'Most Popular') {
      filteredProducts.sort((a, b) => (b.isBestSeller ? 1 : 0).compareTo(a.isBestSeller ? 1 : 0));
    } else if (_sortBy == 'Best Selling') {
      filteredProducts.sort((a, b) => (b.isBestSeller ? 1 : 0).compareTo(a.isBestSeller ? 1 : 0));
    }

    final List<String> categories = ['All', 'Bangles', 'Rings', 'Necklaces', 'Mangalsutras', 'Chains', 'Earrings'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search Input Bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF9F9F9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x1AC5A059)),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                setState(() {
                  _searchQuery = val;
                });
                _searchDebounce?.cancel();
                _searchDebounce = Timer(const Duration(milliseconds: 350), () {
                  if (mounted) {
                    _triggerListingLoad(ms: 500);
                  }
                });
              },
              decoration: InputDecoration(
                hintText: 'Search ornaments, rings, necklaces...',
                hintStyle: const TextStyle(color: Colors.black38, fontSize: 13),
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFC5A059)),
                suffixIcon: _searchQuery.isNotEmpty 
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, color: Color(0xFFC5A059)),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          _searchQuery = '';
                        });
                      },
                    )
                  : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ),

        // Horizontal Category Filter Chips
        SizedBox(
          height: 48,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: categories.length,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemBuilder: (context, index) {
              final cat = categories[index];
              final bool isSelected = (cat == 'All' && _filterState.categories.isEmpty) ||
                  (_filterState.categories.length == 1 && _filterState.categories.first.toLowerCase() == cat.toLowerCase());

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ChoiceChip(
                  label: Text(
                    cat,
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF555555),
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        if (cat == 'All') {
                          _filterState = _filterState.copyWith(categories: []);
                          _selectedCategory = 'All';
                        } else {
                          _filterState = _filterState.copyWith(categories: [cat]);
                          _selectedCategory = cat;
                        }
                      });
                      _triggerListingLoad(ms: 500);
                    }
                  },
                  selectedColor: const Color(0xFFC5A059),
                  backgroundColor: const Color(0xFFF9F6F0),
                  checkmarkColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? const Color(0xFFC5A059) : const Color(0x33C5A059),
                      width: 1,
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        // Filter & Sort Action Row
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: _showFilterSheet,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0x33C5A059), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(5),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.filter_list_rounded, color: Color(0xFFC5A059), size: 18),
                        const SizedBox(width: 8),
                        Text(
                          _hasActiveFilters() ? 'FILTER (ACTIVE)' : 'FILTER',
                          style: const TextStyle(
                            color: Color(0xFF2C2C2C),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: _showSortSheet,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0x33C5A059), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(5),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.sort_rounded, color: Color(0xFFC5A059), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'SORT: ${_sortBy.toUpperCase()}',
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFF2C2C2C),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Dynamic Product Double-Column Grid
        Expanded(
          child: _isListingLoading
              ? const ProductGridSkeleton()
              : filteredProducts.isEmpty
                  ? _buildEmptyState()
                  : GridView.builder(
                  padding: const EdgeInsets.all(12),
                  physics: const BouncingScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.58,
                  ),
                  itemCount: filteredProducts.length,
                  itemBuilder: (context, index) {
                    final product = filteredProducts[index];
                    final double price = widget.provider.getProductPrice(product);
                    final bool isSaved = widget.provider.isWishlisted(product.id);

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
                            // Product Image & Saved Icon
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
                                      child: Icon(
                                        isSaved ? Icons.favorite_rounded : Icons.favorite_outline_rounded,
                                        color: isSaved ? Colors.red : const Color(0xFFC5A059),
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
                ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Expanded(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off_rounded, size: 64, color: Colors.black26),
            const SizedBox(height: 16),
            const Text(
              'No ornaments found',
              style: TextStyle(
                color: Color(0xFF2C2C2C),
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Try adjusting your filters or search keywords.',
              style: TextStyle(
                color: Color(0xFF707070),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Dynamic Product Details sheet (Reused for perfect consistency)
  void _showProductDetails(BuildContext context, Product product) {
    // Obtain active catalog list
    final List<Product> catalog = widget.provider.products.where((p) {
      final bool matchesCategory = _selectedCategory == 'All' || 
          p.category.toLowerCase() == _selectedCategory.toLowerCase();
      
      final bool matchesSearch = p.name.toLowerCase().contains(_searchQuery.toLowerCase()) || 
          p.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.category.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.purity.toLowerCase().contains(_searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    }).toList();

    int currentIndex = catalog.indexWhere((p) => p.id == product.id);
    if (currentIndex == -1) {
      catalog.insert(0, product);
      currentIndex = 0;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: false,
      builder: (context) => ProductDetailSheet(
        itemsList: catalog,
        initialIndex: currentIndex,
        provider: widget.provider,
      ),
    ).then((_) {
      // Trigger setState on sheet close in case favorites were toggled
      setState(() {});
    });
  }
}

// Beautiful Premium Shimmer Skeleton Grid Placeholder for Jewelry
class ProductGridSkeleton extends StatefulWidget {
  const ProductGridSkeleton({super.key});

  @override
  State<ProductGridSkeleton> createState() => _ProductGridSkeletonState();
}

class _ProductGridSkeletonState extends State<ProductGridSkeleton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _opacity = Tween<double>(begin: 0.35, end: 0.75).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _opacity,
      builder: (context, child) {
        return GridView.builder(
          padding: const EdgeInsets.all(12),
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.58,
          ),
          itemCount: 4,
          itemBuilder: (context, index) {
            return Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image Skeleton
                  Container(
                    height: 190,
                    decoration: BoxDecoration(
                      color: Color(0xFFF6F3EB).withValues(alpha: _opacity.value),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title Skeleton
                        Container(
                          height: 12,
                          width: 100,
                          decoration: BoxDecoration(
                            color: Color(0xFFE8E2D5).withValues(alpha: _opacity.value),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 8),
                        // Subtitle Skeleton
                        Container(
                          height: 10,
                          width: 60,
                          decoration: BoxDecoration(
                            color: Color(0xFFEFECE5).withValues(alpha: _opacity.value),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Price Skeleton
                        Container(
                          height: 14,
                          width: 80,
                          decoration: BoxDecoration(
                            color: Color(0xFFC5A059).withValues(alpha: _opacity.value * 0.4),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
