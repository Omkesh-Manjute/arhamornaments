import 'dart:math' as math;
import 'package:flutter/material.dart';

class CustomLogoLoader extends StatefulWidget {
  final double size;
  const CustomLogoLoader({super.key, this.size = 80});

  @override
  State<CustomLogoLoader> createState() => _CustomLogoLoaderState();
}

class _CustomLogoLoaderState extends State<CustomLogoLoader> with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late Animation<double> _rotationAnimation;
  late AnimationController _shimmerController;
  late AnimationController _fadeController;

  @override
  void initState() {
    super.initState();
    // Rotation controller for smooth oscillating 3D turn (coin swaying left to right)
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600), // 1.6 seconds per sway direction (3.2s total cycle) for a luxurious, heavy feel
    )..repeat(reverse: true);

    // Apply Curves.easeInOut to make the turn feel exceptionally organic and smooth at the swing boundaries
    _rotationAnimation = CurvedAnimation(
      parent: _rotationController,
      curve: Curves.easeInOut,
    );

    // Shimmer controller for sweeping gold glow reflection effect
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();

    // Fade-in controller when loader is mounted
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..forward();
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _shimmerController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeController,
      child: Center(
        child: AnimatedBuilder(
          animation: Listenable.merge([_rotationController, _shimmerController]),
          builder: (context, child) {
            // Max swing angle of 72 degrees (math.pi / 2.5 radians)
            const maxAngle = math.pi / 2.5;

            // Map the animation value (0.0 to 1.0) to swing from -72° to +72°
            final angle = -maxAngle + (_rotationAnimation.value * 2 * maxAngle);
            
            // cosVal ranges from cos(maxAngle) at the sides to 1.0 at the center
            final cosVal = math.cos(angle);
            final minCos = math.cos(maxAngle);
            
            // Normalize cosVal to be exactly 0.0 at the extremes and 1.0 at the center
            final normalizedCos = (cosVal - minCos) / (1.0 - minCos);

            // Perspective projection to make it look truly 3D in space
            final transform = Matrix4.identity()
              ..setEntry(3, 2, 0.0018) // Premium subtle 3D depth camera projection
              ..rotateY(angle);

            // Scale dynamically goes from 95% (turned away) to 105% (facing the front) to enhance depth
            final dynamicScale = 0.95 + (normalizedCos * 0.10);

            // Realistic dynamic backing shadow properties driven by normalizedCos
            final shadowOpacity = 0.04 + (normalizedCos * 0.12);
            final shadowBlur = 10.0 + (normalizedCos * 14.0);
            final shadowSpread = 0.5 + (normalizedCos * 2.0);
            final shadowWidth = widget.size * (0.60 + (normalizedCos * 0.30));
            final shadowHeight = 6.0 + (normalizedCos * 4.0);

            return Stack(
              alignment: Alignment.center,
              clipBehavior: Clip.none,
              children: [
                // 1. Static Realistic Ambient Shadow underneath the logo, reflecting 3D proximity
                Transform.translate(
                  offset: Offset(0, (widget.size / 2) + 16),
                  child: Container(
                    width: shadowWidth,
                    height: shadowHeight,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.elliptical(shadowWidth, shadowHeight)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: shadowOpacity),
                          blurRadius: shadowBlur,
                          spreadRadius: shadowSpread,
                        ),
                      ],
                    ),
                  ),
                ),

                // 2. 3D Rotating Logo Container
                Transform(
                  transform: transform,
                  alignment: Alignment.center,
                  child: Transform.scale(
                    scale: dynamicScale,
                    child: Container(
                      width: widget.size,
                      height: widget.size,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        boxShadow: [
                          // Premium pulsating ambient gold outer glow matching the 3D rotation
                          BoxShadow(
                            color: const Color(0xFFC5A059).withValues(alpha: 0.15 + (normalizedCos * 0.25)),
                            blurRadius: 12 + (normalizedCos * 12),
                            spreadRadius: 0.5 + (normalizedCos * 2.5),
                          ),
                        ],
                        border: Border.all(
                          color: const Color(0xFFC5A059),
                          width: 2.5,
                        ),
                      ),
                      child: ClipOval(
                        child: ShaderMask(
                          shaderCallback: (bounds) {
                            final shimmerValue = _shimmerController.value;
                            final alignment = Alignment(
                              -2.0 + (shimmerValue * 4.0),
                              -2.0 + (shimmerValue * 4.0),
                            );
                            return LinearGradient(
                              colors: const [
                                Colors.transparent,
                                Color(0x22FFFFFF),
                                Color(0xDDFFDF79),
                                Color(0x22FFFFFF),
                                Colors.transparent,
                              ],
                              stops: const [0.0, 0.3, 0.5, 0.7, 1.0],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              transform: _GradientSweepTransform(alignment),
                            ).createShader(bounds);
                          },
                          blendMode: BlendMode.srcOver,
                          child: Padding(
                            padding: const EdgeInsets.all(6.0), // Elegant spacing inside the gold ring
                            child: ClipOval(
                              child: Image.asset(
                                'assets/icon.png', // Stylized "A" logo only
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) => Container(
                                  color: const Color(0xFF111827),
                                  child: const Center(
                                    child: Icon(
                                      Icons.filter_vintage_rounded,
                                      color: Color(0xFFC5A059),
                                      size: 36,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _GradientSweepTransform extends GradientTransform {
  final Alignment alignment;
  const _GradientSweepTransform(this.alignment);

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    final w = bounds.width;
    final h = bounds.height;
    final tx = alignment.x * w * 0.5;
    final ty = alignment.y * h * 0.5;
    return Matrix4.translationValues(tx, ty, 0.0);
  }
}
