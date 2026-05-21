import 'package:flutter/material.dart';

class FilterState {
  final List<String> categories;
  final List<String> materials;
  final List<String> occasions;
  final List<String> collections;
  final List<String> priceRanges;

  const FilterState({
    this.categories = const [],
    this.materials = const [],
    this.occasions = const [],
    this.collections = const [],
    this.priceRanges = const [],
  });

  FilterState copyWith({
    List<String>? categories,
    List<String>? materials,
    List<String>? occasions,
    List<String>? collections,
    List<String>? priceRanges,
  }) {
    return FilterState(
      categories: categories ?? this.categories,
      materials: materials ?? this.materials,
      occasions: occasions ?? this.occasions,
      collections: collections ?? this.collections,
      priceRanges: priceRanges ?? this.priceRanges,
    );
  }

  bool get isEmpty =>
      categories.isEmpty &&
      materials.isEmpty &&
      occasions.isEmpty &&
      collections.isEmpty &&
      priceRanges.isEmpty;

  FilterState clear() {
    return const FilterState();
  }
}

class OrnamentsAccordionFilter extends StatelessWidget {
  final FilterState state;
  final Function(FilterState) onChanged;
  final bool showApplyButton;
  final VoidCallback? onApply;

  const OrnamentsAccordionFilter({
    super.key,
    required this.state,
    required this.onChanged,
    this.showApplyButton = false,
    this.onApply,
  });

  static const List<String> categoriesList = [
    'Earrings', 'Rings', 'Bracelets', 'Nose Jewelry', 'Necklaces', 'Pendants', 
    'Pendant Sets', 'Bangles', 'Mangalsutra', 'Coins', 'Chain Sets', 'Chains', 
    'Kadas', 'Necklace Sets', 'Temple Necklaces', 'Thushi'
  ];

  static const List<String> materialsList = [
    'Gold', 'Silver', 'Diamond', 'Platinum'
  ];

  static const List<String> occasionsList = [
    'Office Wear', 'Modern Wear', 'Casual Wear', 'Traditional Wear', 'Bridal', 'Daily Wear', 'Party Wear', 'Gifting'
  ];

  static const List<String> collectionsList = [
    "Men's Collection", "Women's Collection", "Kids Collection", "Unisex Collection"
  ];

  static const List<String> priceRangesList = [
    'Under ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', 'Above ₹1,00,000'
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            physics: const ClampingScrollPhysics(),
            children: [
              _buildAccordionGroup(
                context: context,
                title: 'CATEGORY',
                options: categoriesList,
                selectedItems: state.categories,
                onToggle: (item) {
                  final list = List<String>.from(state.categories);
                  if (list.contains(item)) {
                    list.remove(item);
                  } else {
                    list.add(item);
                  }
                  onChanged(state.copyWith(categories: list));
                },
                onClear: () {
                  onChanged(state.copyWith(categories: []));
                },
              ),
              const SizedBox(height: 12),
              _buildAccordionGroup(
                context: context,
                title: 'MATERIAL',
                options: materialsList,
                selectedItems: state.materials,
                onToggle: (item) {
                  final list = List<String>.from(state.materials);
                  if (list.contains(item)) {
                    list.remove(item);
                  } else {
                    list.add(item);
                  }
                  onChanged(state.copyWith(materials: list));
                },
                onClear: () {
                  onChanged(state.copyWith(materials: []));
                },
              ),
              const SizedBox(height: 12),
              _buildAccordionGroup(
                context: context,
                title: 'OCCASION',
                options: occasionsList,
                selectedItems: state.occasions,
                onToggle: (item) {
                  final list = List<String>.from(state.occasions);
                  if (list.contains(item)) {
                    list.remove(item);
                  } else {
                    list.add(item);
                  }
                  onChanged(state.copyWith(occasions: list));
                },
                onClear: () {
                  onChanged(state.copyWith(occasions: []));
                },
              ),
              const SizedBox(height: 12),
              _buildAccordionGroup(
                context: context,
                title: 'COLLECTION',
                options: collectionsList,
                selectedItems: state.collections,
                onToggle: (item) {
                  final list = List<String>.from(state.collections);
                  if (list.contains(item)) {
                    list.remove(item);
                  } else {
                    list.add(item);
                  }
                  onChanged(state.copyWith(collections: list));
                },
                onClear: () {
                  onChanged(state.copyWith(collections: []));
                },
              ),
              const SizedBox(height: 12),
              _buildAccordionGroup(
                context: context,
                title: 'PRICE RANGE',
                options: priceRangesList,
                selectedItems: state.priceRanges,
                onToggle: (item) {
                  final list = List<String>.from(state.priceRanges);
                  if (list.contains(item)) {
                    list.remove(item);
                  } else {
                    list.add(item);
                  }
                  onChanged(state.copyWith(priceRanges: list));
                },
                onClear: () {
                  onChanged(state.copyWith(priceRanges: []));
                },
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
        if (showApplyButton) ...[
          Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).padding.bottom > 0 ? 12 : 24,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(15),
                  blurRadius: 8,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF707070),
                      side: const BorderSide(color: Color(0xFFE8E2D5)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                    onPressed: () {
                      onChanged(state.clear());
                    },
                    child: const Text(
                      'CLEAR ALL',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFD4AF37), Color(0xFFC5A059)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFC5A059).withAlpha(76),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                      onPressed: onApply,
                      child: const Text(
                        'APPLY FILTERS',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildAccordionGroup({
    required BuildContext context,
    required String title,
    required List<String> options,
    required List<String> selectedItems,
    required Function(String) onToggle,
    required VoidCallback onClear,
  }) {
    final bool hasSelection = selectedItems.isNotEmpty;

    return Theme(
      data: Theme.of(context).copyWith(
        dividerColor: Colors.transparent,
        hoverColor: Colors.transparent,
        splashColor: Colors.transparent,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: hasSelection ? const Color(0xFFC5A059) : const Color(0xFFE8E2D5),
            width: hasSelection ? 1.5 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: hasSelection 
                  ? const Color(0xFFC5A059).withAlpha(15)
                  : Colors.black.withAlpha(5),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ExpansionTile(
          key: PageStorageKey<String>(title),
          title: Row(
            children: [
              Text(
                title,
                style: TextStyle(
                  color: hasSelection ? const Color(0xFFC5A059) : const Color(0xFF2C2C2C),
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              if (hasSelection) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFC5A059),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${selectedItems.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (hasSelection)
                GestureDetector(
                  onTap: onClear,
                  child: Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Text(
                      'Clear',
                      style: TextStyle(
                        color: const Color(0xFFC5A059).withAlpha(204),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: Color(0xFFC5A059),
              ),
            ],
          ),
          childrenPadding: const EdgeInsets.only(bottom: 12),
          children: options.map((option) {
            final bool isSelected = selectedItems.contains(option);
            return InkWell(
              onTap: () => onToggle(option),
              splashColor: const Color(0x1AC5A059),
              highlightColor: const Color(0x0AC5A059),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  children: [
                    // Premium Gold Themed Checkbox
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFFC5A059) : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: isSelected ? const Color(0xFFC5A059) : const Color(0xFFB0B0B0),
                          width: 1.5,
                        ),
                      ),
                      child: isSelected
                          ? const Icon(
                              Icons.check_rounded,
                              size: 14,
                              color: Colors.white,
                            )
                          : null,
                    ),
                    const SizedBox(width: 14),
                    Text(
                      option,
                      style: TextStyle(
                        color: isSelected ? const Color(0xFF2C2C2C) : const Color(0xFF606060),
                        fontSize: 13.5,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
