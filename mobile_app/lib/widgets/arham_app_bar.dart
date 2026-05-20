import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/store_provider.dart';

/// A premium, reusable branded AppBar for all Arham Ornaments screens.
///
/// - [showHamburger]: If true (only on Home), shows the drawer toggle icon.
///   On all other screens the hamburger is hidden. A back arrow is shown
///   automatically whenever the route can be popped (pushed sub-screens).
/// - [provider]: Required to read dynamic wishlist badge count.
/// - [onWishlistTap]: Optional override for the wishlist icon tap. When null,
///   pressing the wishlist icon does nothing (caller should supply a handler).
class ArhamAppBar extends StatelessWidget implements PreferredSizeWidget {
  final StoreProvider provider;
  final bool showHamburger;

  /// Called when the wishlist icon is tapped.
  /// Supply this from each screen/parent so the navigation logic stays
  /// outside the widget, avoiding circular import chains.
  final VoidCallback? onWishlistTap;

  const ArhamAppBar({
    super.key,
    required this.provider,
    this.showHamburger = false,
    this.onWishlistTap,
  });

  // ---------------------------------------------------------------------------
  // PreferredSizeWidget conformance – standard AppBar height + 1 px separator
  // ---------------------------------------------------------------------------
  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 1.0);

  // ---------------------------------------------------------------------------
  // Support dialer
  // ---------------------------------------------------------------------------
  Future<void> _callSupport(BuildContext context) async {
    final Uri tel = Uri.parse('tel:+919371504182');
    try {
      if (await canLaunchUrl(tel)) {
        await launchUrl(tel);
      } else {
        throw 'Could not launch dialer';
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Support line: +91 93715 04182'),
            backgroundColor: Color(0xFFC5A059),
          ),
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    // Determine whether this route sits on top of another (back-navigable).
    final bool canPop = Navigator.canPop(context);

    // Leading widget logic:
    //   Home tab  → hamburger drawer button
    //   Pushed sub-screen → premium gold back arrow
    //   Other tabs (Shop/Categories/etc.) → null (title aligns to left edge)
    Widget? leading;
    if (showHamburger) {
      leading = Builder(
        builder: (ctx) => IconButton(
          icon: const Icon(Icons.menu_rounded, color: Color(0xFFC5A059)),
          tooltip: 'Open menu',
          onPressed: () => Scaffold.of(ctx).openDrawer(),
        ),
      );
    } else if (canPop) {
      leading = IconButton(
        icon: const Icon(
          Icons.arrow_back_ios_new_rounded,
          color: Color(0xFFC5A059),
          size: 20,
        ),
        tooltip: 'Back',
        onPressed: () => Navigator.maybePop(context),
      );
    }

    return AppBar(
      elevation: 0,
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.transparent,
      // When there's no leading widget, push the title all the way to the left
      // edge (16 dp margin) for a clean, symmetric non-hamburger layout.
      titleSpacing: showHamburger || canPop ? null : 16.0,
      automaticallyImplyLeading: false,
      leading: leading,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Circular logo thumbnail
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: Image.asset(
              'assets/logo.jpg',
              height: 26,
              width: 26,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const Icon(
                Icons.filter_vintage_rounded,
                color: Color(0xFFC5A059),
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: 9),
          // Brand name
          const Text(
            'ARHAM ORNAMENTS',
            style: TextStyle(
              color: Color(0xFF2C2C2C),
              fontSize: 14,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.4,
            ),
          ),
        ],
      ),
      actions: [
        // ── Wishlist icon with live badge ──────────────────────────────────
        AnimatedBuilder(
          animation: provider,
          builder: (context, _) {
            final int count = provider.wishlistItems.length;
            return IconButton(
              tooltip: 'Wishlist',
              icon: Badge(
                label: Text('$count'),
                isLabelVisible: count > 0,
                backgroundColor: const Color(0xFFC5A059),
                textColor: Colors.white,
                child: const Icon(
                  Icons.favorite_border_rounded,
                  color: Color(0xFFC5A059),
                ),
              ),
              onPressed: onWishlistTap,
            );
          },
        ),
        // ── Support / help icon ────────────────────────────────────────────
        IconButton(
          tooltip: 'Call support',
          icon: const Icon(Icons.support_agent_rounded, color: Color(0xFFC5A059)),
          onPressed: () => _callSupport(context),
        ),
        const SizedBox(width: 4),
      ],
      // Elegant 1 px gold-tinted separator line at the bottom
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.0),
        child: Container(color: const Color(0x1AC5A059), height: 1.0),
      ),
    );
  }
}
