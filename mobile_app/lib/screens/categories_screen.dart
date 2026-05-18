import 'package:flutter/material.dart';
import '../providers/store_provider.dart';
import '../widgets/ornaments_accordion_filter.dart';

class CategoriesScreen extends StatefulWidget {
  final StoreProvider provider;
  final Function(FilterState) onApplyFilters;

  const CategoriesScreen({
    super.key,
    required this.provider,
    required this.onApplyFilters,
  });

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  FilterState _localFilterState = const FilterState();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFAF6),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Elegant Header Title
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'EXPLORE CATEGORIES & FILTERS',
                  style: TextStyle(
                    color: Color(0xFF2C2C2C),
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  width: 40,
                  height: 2,
                  color: const Color(0xFFC5A059),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Select multiple attributes below to instantly customize and browse our premium 22-karat gold collections.',
                  style: TextStyle(
                    color: Color(0xFF707070),
                    fontSize: 12,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),

          // Collapsible Accordion Browser
          Expanded(
            child: OrnamentsAccordionFilter(
              state: _localFilterState,
              showApplyButton: true,
              onChanged: (newState) {
                setState(() {
                  _localFilterState = newState;
                });
              },
              onApply: () {
                widget.onApplyFilters(_localFilterState);
              },
            ),
          ),
        ],
      ),
    );
  }
}
